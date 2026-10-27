import { readClipboardText, writeClipboardText } from "@dextinity/admin";
import isEqual from "lodash.isequal";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { useProgressDialog } from "../../common/useProgressDialog";
import { type ContentScope, useContentScope } from "../../contentScope/Provider";
import { useDamScopeFromContentScope } from "../../dam/config/useDamScope";
import { copyDamFilesToScope, type DamFileToCopy } from "../../dam/copyFilesToScope/copyDamFilesToScope";
import { damFileFromDependency, isDamFileDependency } from "../../dam/copyFilesToScope/damFileDependencies";
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

type ClipboardDependency = Pick<BlockDependency, "targetGraphqlObjectType" | "id"> & Omit<DamFileToCopy, "id">;

interface TransformedClipboardBlock {
    name: string;
    visible: boolean;
    output: BlockOutputApi<BlockInterface>;
    additionalFields?: Record<string, unknown>;
    dependencies?: ClipboardDependency[];
}

interface TransformedClipboardContent {
    contentScope: ContentScope;
    blocks: TransformedClipboardBlock[];
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

            const dependencies = (blockInterface.dependencies?.(block.state) ?? []).map<ClipboardDependency>((dependency) => {
                if (isDamFileDependency(dependency)) {
                    const damFile = damFileFromDependency(dependency);
                    return { targetGraphqlObjectType: dependency.targetGraphqlObjectType, ...damFile, scope: damFile.scope ?? damScope };
                }

                return { targetGraphqlObjectType: dependency.targetGraphqlObjectType, id: dependency.id };
            });

            return {
                name: block.name,
                visible: block.visible,
                output: blockInterface.state2Output(block.state),
                additionalFields: block.additionalFields,
                dependencies: dependencies.length > 0 ? dependencies : undefined,
            };
        });

        return writeClipboardText(JSON.stringify({ contentScope, blocks } satisfies TransformedClipboardContent));
    };

    const copyReferencedDamFilesToScope = async (blocks: TransformedClipboardBlock[]) => {
        if (Object.keys(damScope).length === 0) {
            return [];
        }

        const files = blocks
            .flatMap((block) => block.dependencies ?? [])
            .filter((dependency) => dependency.targetGraphqlObjectType === "DamFile" && !isEqual(dependency.scope, damScope));

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
            dependencyReplacements = await copyReferencedDamFilesToScope(transformedContent.blocks);
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

        const isPastingIntoOtherContentScope = !isEqual(transformedContent.contentScope, contentScope);
        const blocks: ClipboardBlock[] = [];

        for (const { clipboardBlock, blockInterface } of clipboardBlocks) {
            let state: BlockState<BlockInterface>;

            try {
                const replacements = [...dependencyReplacements];

                if (isPastingIntoOtherContentScope) {
                    const dependenciesToRemove = (clipboardBlock.dependencies ?? []).filter(
                        (dependency) => dependency.targetGraphqlObjectType !== "DamFile",
                    );

                    replacements.push(...createUndefinedReplacementsForDependencies(dependenciesToRemove));
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
