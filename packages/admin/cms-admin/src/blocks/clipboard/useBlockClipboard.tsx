import { readClipboardText, writeClipboardText } from "@dextinity/admin";
import isEqual from "lodash.isequal";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { useProgressDialog } from "../../common/useProgressDialog";
import { useDamScope } from "../../dam/config/useDamScope";
import { copyDamFilesToScope, type DamFileToCopy } from "../../dam/copyFilesToScope/copyDamFilesToScope";
import { damFilesFromDependencies } from "../../dam/copyFilesToScope/damFileDependencies";
import { useBlockContext } from "../context/useBlockContext";
import type { BlockInterface, BlockOutputApi, BlockState, ReplaceDependencyObject } from "../types";

interface ClipboardBlock {
    name: string;
    visible: boolean;
    state: BlockState<BlockInterface>;
    additionalFields?: Record<string, unknown>;
}

type ClipboardContent = ClipboardBlock[];

interface TransformedClipboardBlock {
    name: string;
    visible: boolean;
    output: BlockOutputApi<BlockInterface>;
    additionalFields?: Record<string, unknown>;
    /**
     * The DAM files referenced by the block. Their scope can't be determined when pasting,
     * therefore it has to be written to the clipboard when copying.
     */
    damFiles?: DamFileToCopy[];
}

interface TransformedClipboardContent {
    blocks: TransformedClipboardBlock[];
    /** The DAM scope the blocks were copied from. */
    damScope?: Record<string, unknown>;
}

type GetClipboardContentResponse = { canPaste: true; content: ClipboardContent } | { canPaste: false; error: ReactNode };

interface BlockClipboardApi {
    updateClipboardContent: (content: ClipboardContent) => Promise<void>;
    getClipboardContent: () => Promise<GetClipboardContentResponse>;
    progressDialog: ReactNode;
}

interface UseBlockClipboardOptions {
    supports: BlockInterface | BlockInterface[];
}

function useBlockClipboard({ supports }: UseBlockClipboardOptions): BlockClipboardApi {
    const context = useBlockContext();
    const damScope = useDamScope();
    const progress = useProgressDialog({
        title: <FormattedMessage id="dextinity.blocks.insertingBlocks" defaultMessage="Inserting blocks" />,
    });
    const updateProgress = progress.updateProgress;

    const findBlockInterfaceForClipboardBlock = (content: ClipboardBlock | TransformedClipboardBlock) => {
        if (Array.isArray(supports)) {
            return supports.find((block) => block.name === content.name);
        }

        if (supports.name !== content.name) {
            return undefined;
        }

        return supports;
    };

    const updateClipboardContent = async (content: ClipboardContent) => {
        const blocks = content.map<TransformedClipboardBlock>((block) => {
            const blockInterface = findBlockInterfaceForClipboardBlock(block);

            if (!blockInterface) {
                throw new Error(`Block clipboard doesn't support block "${block.name}"`);
            }

            const damFiles = damFilesFromDependencies(blockInterface.dependencies?.(block.state) ?? []);

            return {
                name: block.name,
                visible: block.visible,
                output: blockInterface.state2Output(block.state),
                additionalFields: block.additionalFields,
                damFiles: damFiles.length > 0 ? damFiles : undefined,
            };
        });

        return writeClipboardText(JSON.stringify({ blocks, damScope } satisfies TransformedClipboardContent));
    };

    /**
     * Copies the DAM files referenced by the blocks from the clipboard into the current DAM scope and returns the
     * replacements required to point the blocks to the copies.
     */
    const copyReferencedDamFilesToScope = async ({ blocks, damScope: sourceDamScope }: TransformedClipboardContent) => {
        if (isEqual(sourceDamScope, damScope)) {
            // Source and target DAM scope are the same, the files can be used as they are
            return [];
        }

        const files = blocks.flatMap(
            (block) =>
                block.damFiles?.map((file) => ({
                    ...file,
                    // Files without a known scope originate from the scope the blocks were copied from
                    scope: file.scope ?? sourceDamScope,
                })) ?? [],
        );

        if (files.length === 0) {
            return [];
        }

        try {
            updateProgress(0, <FormattedMessage id="dextinity.blocks.pasteBlock.copyingAssets" defaultMessage="copying assets" />);

            return await copyDamFilesToScope({
                client: context.apolloClient,
                files,
                targetDamScope: damScope,
                updateProgress: (progress) =>
                    updateProgress(
                        progress * 100,
                        <FormattedMessage id="dextinity.blocks.pasteBlock.copyingAssets" defaultMessage="copying assets" />,
                    ),
            });
        } finally {
            updateProgress(undefined); //hides progress dialog
        }
    };

    const getClipboardContent = async (): Promise<GetClipboardContentResponse> => {
        const text = await readClipboardText();

        if (text === undefined) {
            return {
                canPaste: false,
                error: (
                    <FormattedMessage
                        id="dextinity.blocks.cannotPasteBlock.messageFailedToReadClipboard"
                        defaultMessage="Can't read clipboard content. Please make sure that clipboard access is given"
                    />
                ),
            };
        }

        if (text.trim() === "") {
            return {
                canPaste: false,
                error: <FormattedMessage id="dextinity.blocks.cannotPasteBlock.messageEmptyClipboard" defaultMessage="Clipboard is empty" />,
            };
        }

        const failedToParseClipboardResponse: GetClipboardContentResponse = {
            canPaste: false,
            error: (
                <FormattedMessage
                    id="dextinity.blocks.cannotPasteBlock.messageFailedToParseClipboard"
                    defaultMessage="Content from clipboard aren't valid blocks"
                />
            ),
        };

        let transformedContent: TransformedClipboardContent;

        try {
            const parsedText = JSON.parse(text);

            // Blocks copied by an earlier version only contain the blocks themselves, without any scope information
            transformedContent = Array.isArray(parsedText) ? { blocks: parsedText } : parsedText;
        } catch {
            return failedToParseClipboardResponse;
        }

        if (!Array.isArray(transformedContent?.blocks)) {
            return failedToParseClipboardResponse;
        }

        const clipboardBlocks: Array<{ clipboardBlock: TransformedClipboardBlock; blockInterface: BlockInterface }> = [];

        for (const clipboardBlock of transformedContent.blocks) {
            const blockInterface = findBlockInterfaceForClipboardBlock(clipboardBlock);

            if (!blockInterface) {
                return {
                    canPaste: false,
                    error: (
                        <FormattedMessage
                            id="dextinity.blocks.cannotPasteBlock.messageUnsupportedBlock"
                            defaultMessage="Blocks from clipboard aren't allowed here"
                        />
                    ),
                };
            }

            clipboardBlocks.push({ clipboardBlock, blockInterface });
        }

        let dependencyReplacements: ReplaceDependencyObject[];

        try {
            dependencyReplacements = await copyReferencedDamFilesToScope(transformedContent);
        } catch {
            return {
                canPaste: false,
                error: (
                    <FormattedMessage
                        id="dextinity.blocks.cannotPasteBlock.messageFailedToCopyAssets"
                        defaultMessage="Failed to copy the assets used by the blocks from clipboard into this scope"
                    />
                ),
            };
        }

        const blocks: ClipboardBlock[] = [];

        for (const { clipboardBlock, blockInterface } of clipboardBlocks) {
            let state: BlockState<BlockInterface>;

            try {
                const output =
                    dependencyReplacements.length > 0
                        ? blockInterface.replaceDependenciesInOutput(clipboardBlock.output, dependencyReplacements)
                        : clipboardBlock.output;

                state = await blockInterface.output2State(output, context);
            } catch {
                return {
                    canPaste: false,
                    error: (
                        <FormattedMessage
                            id="dextinity.blocks.cannotPasteBlock.messageFailedToCreateBlock"
                            defaultMessage="Failed to create a copy of the blocks from clipboard"
                        />
                    ),
                };
            }

            blocks.push({ name: clipboardBlock.name, visible: clipboardBlock.visible, state, additionalFields: clipboardBlock.additionalFields });
        }

        return { canPaste: true, content: blocks };
    };

    return { updateClipboardContent, getClipboardContent, progressDialog: progress.dialog };
}

export { type ClipboardContent, useBlockClipboard };
