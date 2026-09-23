import { readClipboardText, writeClipboardText } from "@dextinity/admin";
import isEqual from "lodash.isequal";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { useProgressDialog } from "../../common/useProgressDialog";
import { type ContentScope, useContentScope } from "../../contentScope/Provider";
import { useDamScopeFromContentScope } from "../../dam/config/useDamScope";
import { copyDamFilesToScope, type DamFileToCopy } from "../../dam/copyFilesToScope/copyDamFilesToScope";
import { damFilesFromDependencies, isDamFileDependency } from "../../dam/copyFilesToScope/damFileDependencies";
import { useBlockContext } from "../context/useBlockContext";
import { createUndefinedReplacementsForDependencies } from "../helpers/createUndefinedReplacementsForDependencies";
import type { BlockDependency, BlockInterface, BlockOutputApi, BlockState, ReplaceDependencyObject } from "../types";

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
     * The DAM files referenced by the block, including the scope they live in. The scope can't be determined when
     * pasting, therefore it has to be written to the clipboard when copying.
     */
    damFiles?: DamFileToCopy[];
    /**
     * The content scope the block was copied from. Used to detect pasting into another scope.
     */
    contentScope?: ContentScope;
    /**
     * The dependencies of the block that aren't handled by copying the DAM files. They are removed when pasting into
     * another scope, e.g., links to pages of the source scope.
     */
    dependencies?: Array<Pick<BlockDependency, "targetGraphqlObjectType" | "id">>;
}

type TransformedClipboardContent = TransformedClipboardBlock[];

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
    const { scope: contentScope } = useContentScope();
    const damScope = useDamScopeFromContentScope();
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

            const blockDependencies = blockInterface.dependencies?.(block.state) ?? [];

            const damFiles = damFilesFromDependencies(blockDependencies).map((damFile) => ({
                ...damFile,
                // Files that were selected in the Admin don't know their scope, they live in the scope that is currently edited
                scope: damFile.scope ?? damScope,
            }));

            const dependencies = blockDependencies
                .filter((dependency) => !isDamFileDependency(dependency))
                .map(({ targetGraphqlObjectType, id }) => ({ targetGraphqlObjectType, id }));

            return {
                name: block.name,
                visible: block.visible,
                output: blockInterface.state2Output(block.state),
                additionalFields: block.additionalFields,
                damFiles: damFiles.length > 0 ? damFiles : undefined,
                contentScope,
                dependencies: dependencies.length > 0 ? dependencies : undefined,
            };
        });

        return writeClipboardText(JSON.stringify(blocks satisfies TransformedClipboardContent));
    };

    /**
     * Copies the DAM files referenced by the blocks from the clipboard into the current DAM scope and returns the
     * replacements required to point the blocks to the copies.
     */
    const copyReferencedDamFilesToScope = async (blocks: TransformedClipboardContent) => {
        // Without DAM scoping every file can be used in every scope
        if (Object.keys(damScope).length === 0) {
            return [];
        }

        // Files that already live in the target scope can be used as they are
        const files = blocks.flatMap((block) => block.damFiles ?? []).filter((file) => !isEqual(file.scope, damScope));

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
            transformedContent = JSON.parse(text);
        } catch {
            return failedToParseClipboardResponse;
        }

        if (!Array.isArray(transformedContent)) {
            return failedToParseClipboardResponse;
        }

        const clipboardBlocks: Array<{ clipboardBlock: TransformedClipboardBlock; blockInterface: BlockInterface }> = [];

        for (const clipboardBlock of transformedContent) {
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
                const replacements = [...dependencyReplacements];

                // Remove unhandled dependencies when pasting into another scope (same as when pasting pages)
                if (clipboardBlock.contentScope && !isEqual(clipboardBlock.contentScope, contentScope)) {
                    const unhandledDependencies = (clipboardBlock.dependencies ?? []).filter(
                        (dependency) =>
                            !replacements.some(
                                (replacement) => replacement.originalId === dependency.id && replacement.type === dependency.targetGraphqlObjectType,
                            ),
                    );

                    replacements.push(...createUndefinedReplacementsForDependencies(unhandledDependencies));
                }

                const output =
                    replacements.length > 0 ? blockInterface.replaceDependenciesInOutput(clipboardBlock.output, replacements) : clipboardBlock.output;

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
