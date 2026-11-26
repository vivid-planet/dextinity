import {
    createEmptyTipTapRichTextContent,
    getTipTapRichTextExtensions,
    type TipTapRichTextContent,
    TipTapRichTextEditor,
    type TipTapRichTextEditorLink,
    type TipTapRichTextEditorOptions,
    TipTapRichTextEditorToolbarButton,
    type TipTapRichTextEditorToolbarItemsProps,
    translateTipTapRichTextContent,
} from "@dextinity/admin";
import { Add } from "@dextinity/admin-icons";
import { Menu, MenuItem } from "@mui/material";
import type { Extensions } from "@tiptap/core";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface, type BlockState, type LinkBlockInterface, type ReadOnlyBlockRenderInterface } from "../types";
import { ChildBlocksContext } from "./ChildBlocksContext";
import { CmsBlock, CmsInlineBlock } from "./extensions/CmsBlock";
import { TipTapBlockDialog } from "./TipTapBlockDialog";

export type {
    TipTapInlineStyle,
    TipTapListOptions,
    TipTapPlaceholder,
    TipTapRichTextContent as TipTapRichTextBlockContent,
    TipTapTextBlock,
    TipTapTextBlockElement,
    TipTapTextBlockElementProps,
    TipTapTextBlockStyle,
    TipTapTextBlockTag,
} from "@dextinity/admin";
export { isTipTapRichTextEmpty } from "@dextinity/admin";

type JSONContent = TipTapRichTextContent;

export interface TipTapRichTextBlockState {
    tipTapContent: JSONContent;
}

interface TipTapRichTextBlockData {
    tipTapContent: JSONContent;
}

interface TipTapRichTextBlockInput {
    tipTapContent: JSONContent;
}

interface TipTapChildBlock {
    block: BlockInterface;
    /**
     * How the child block is displayed in the editor (and rendered output): as a standalone block
     * element on its own line (`"block"`) or inline within the surrounding text (`"inline"`).
     */
    display: "block" | "inline";
}

export interface TipTapRichTextBlockFactoryOptions extends Omit<
    TipTapRichTextEditorOptions,
    "link" | "extensions" | "toolbarItems" | "translateNodeData"
> {
    /**
     * Enables links by passing the link block that is used for them. Disabled by default.
     */
    link?: BlockInterface & LinkBlockInterface;
    /**
     * Child blocks that can be inserted into the editor via the toolbar's "+" menu, keyed by a
     * stable key. The key (not the block's name) is stored in the content, so blocks can be
     * renamed or swapped without invalidating existing content.
     * Each block is rendered as a non-editable preview that can be edited (dialog) or removed.
     *
     * Pass `{ block, display }` for each child block, where `display` is `"block"` (standalone
     * block element) or `"inline"` (inline within the surrounding text).
     */
    childBlocks?: Record<string, TipTapChildBlock>;
}

function getPlainTextFromContent(content: JSONContent): string {
    let text = "";
    if (content.text) {
        text += content.text;
    }
    if (content.content) {
        for (const child of content.content) {
            text += getPlainTextFromContent(child);
        }
    }
    return text;
}

function getTextLines(content: JSONContent): string[] {
    if (content.type !== "textBlock") {
        return (content.content ?? []).flatMap(getTextLines);
    }
    const lines = [""];
    for (const child of content.content ?? []) {
        if (child.type === "hardBreak") {
            lines.push("");
        } else {
            lines[lines.length - 1] += getPlainTextFromContent(child);
        }
    }
    return lines;
}

const isCmsBlockNode = (content: JSONContent): boolean => content.type === "cmsBlock" || content.type === "cmsInlineBlock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLinkMarksData(content: JSONContent, fn: (data: any) => any): JSONContent {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (Array.isArray(result.marks)) {
        result.marks = result.marks.map((mark) => {
            if (mark.type === "link" && mark.attrs?.data) {
                return { ...mark, attrs: { ...mark.attrs, data: fn(mark.attrs.data) } };
            }
            return mark;
        });
    }

    if (Array.isArray(result.content)) {
        result.content = result.content.map((child) => mapLinkMarksData(child, fn));
    }

    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mapLinkMarksDataAsync(content: JSONContent, fn: (data: any) => Promise<any>): Promise<JSONContent> {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (Array.isArray(result.marks)) {
        result.marks = await Promise.all(
            result.marks.map(async (mark) => {
                if (mark.type === "link" && mark.attrs?.data) {
                    return { ...mark, attrs: { ...mark.attrs, data: await fn(mark.attrs.data) } };
                }
                return mark;
            }),
        );
    }

    if (Array.isArray(result.content)) {
        result.content = await Promise.all(result.content.map((child) => mapLinkMarksDataAsync(child, fn)));
    }

    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCmsBlockNodesData(content: JSONContent, fn: (blockType: string, data: any) => any): JSONContent {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (isCmsBlockNode(result) && result.attrs?.blockType) {
        result.attrs = { ...result.attrs, data: fn(result.attrs.blockType, result.attrs.data) };
    }

    if (Array.isArray(result.content)) {
        result.content = result.content.map((child) => mapCmsBlockNodesData(child, fn));
    }

    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mapCmsBlockNodesDataAsync(content: JSONContent, fn: (blockType: string, data: any) => Promise<any>): Promise<JSONContent> {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (isCmsBlockNode(result) && result.attrs?.blockType) {
        result.attrs = { ...result.attrs, data: await fn(result.attrs.blockType, result.attrs.data) };
    }

    if (Array.isArray(result.content)) {
        result.content = await Promise.all(result.content.map((child) => mapCmsBlockNodesDataAsync(child, fn)));
    }

    return result;
}

function collectCmsBlockNodes(content: JSONContent): Array<{ blockType: string; data: unknown }> {
    const results: Array<{ blockType: string; data: unknown }> = [];

    if (isCmsBlockNode(content) && content.attrs?.blockType) {
        results.push({ blockType: content.attrs.blockType, data: content.attrs.data });
    }

    if (Array.isArray(content.content)) {
        for (const child of content.content) {
            results.push(...collectCmsBlockNodes(child));
        }
    }

    return results;
}

function collectLinkMarksData(content: JSONContent): unknown[] {
    const results: unknown[] = [];

    if (Array.isArray(content.marks)) {
        for (const mark of content.marks) {
            if (mark.type === "link" && mark.attrs?.data) {
                results.push(mark.attrs.data);
            }
        }
    }

    if (Array.isArray(content.content)) {
        for (const child of content.content) {
            results.push(...collectLinkMarksData(child));
        }
    }

    return results;
}

function createLink(linkBlock: BlockInterface & LinkBlockInterface): TipTapRichTextEditorLink<BlockState<typeof linkBlock>> {
    return {
        createInitialData: () => linkBlock.defaultValues(),
        Form: ({ data, onChange }) => <linkBlock.AdminComponent state={data} updateState={onChange} />,
        translateData: linkBlock.translateContent,
    };
}

function createChildBlocksToolbarItems(childBlocks: Record<string, TipTapChildBlock>) {
    return function ChildBlocksToolbarItems({ editor }: TipTapRichTextEditorToolbarItemsProps) {
        const intl = useIntl();
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const [insertChildBlock, setInsertChildBlock] = useState<({ key: string } & TipTapChildBlock) | null>(null);

        const handleClose = () => {
            setAnchorEl(null);
            setTimeout(() => editor.commands.focus(), 0);
        };

        return (
            <>
                <TipTapRichTextEditorToolbarButton
                    icon={<Add />}
                    tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.insertBlock.tooltip" defaultMessage="Insert block" />}
                    ariaLabel={intl.formatMessage({ id: "dextinity.blocks.tipTapRichText.insertBlock.tooltip", defaultMessage: "Insert block" })}
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                />
                <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}>
                    {Object.entries(childBlocks).map(([key, childBlock]) => (
                        <MenuItem
                            key={key}
                            onClick={() => {
                                // Refocusing the editor here would steal focus from the dialog after it has opened
                                setAnchorEl(null);
                                setInsertChildBlock({ key, ...childBlock });
                            }}
                        >
                            {childBlock.block.displayName}
                        </MenuItem>
                    ))}
                </Menu>
                {insertChildBlock && (
                    <TipTapBlockDialog
                        block={insertChildBlock.block}
                        initialState={insertChildBlock.block.defaultValues() as BlockState<typeof insertChildBlock.block>}
                        isEditing={false}
                        onSubmit={(data) => {
                            const attrs = { blockType: insertChildBlock.key, data };
                            if (insertChildBlock.display === "inline") {
                                editor.commands.insertCmsInlineBlock(attrs);
                            } else {
                                editor.commands.insertCmsBlock(attrs);
                            }
                        }}
                        onClose={() => setInsertChildBlock(null)}
                    />
                )}
            </>
        );
    };
}

function createEditorOptions({ link: linkBlock, childBlocks = {}, ...options }: TipTapRichTextBlockFactoryOptions): TipTapRichTextEditorOptions {
    const childBlockEntries = Object.values(childBlocks);
    if (childBlockEntries.length === 0) {
        return { ...options, link: linkBlock && createLink(linkBlock) };
    }

    const extensions: Extensions = [
        ...(childBlockEntries.some((childBlock) => childBlock.display === "block") ? [CmsBlock] : []),
        ...(childBlockEntries.some((childBlock) => childBlock.display === "inline") ? [CmsInlineBlock] : []),
    ];

    return {
        ...options,
        link: linkBlock && createLink(linkBlock),
        extensions,
        toolbarItems: createChildBlocksToolbarItems(childBlocks),
        translateNodeData: async (node, translate) => {
            const childBlock = isCmsBlockNode(node) ? childBlocks[node.attrs?.blockType]?.block : undefined;
            return childBlock?.translateContent ? childBlock.translateContent(node.attrs?.data, translate) : node.attrs?.data;
        },
    };
}

/**
 * The TipTap extensions the block's editor uses.
 */
export function buildTipTapExtensions(options: TipTapRichTextBlockFactoryOptions = {}): Extensions {
    return getTipTapRichTextExtensions(createEditorOptions(options));
}

export type TipTapRichTextBlockInterface = BlockInterface<TipTapRichTextBlockData, TipTapRichTextBlockState, TipTapRichTextBlockInput> &
    ReadOnlyBlockRenderInterface<TipTapRichTextBlockState>;

export const createTipTapRichTextBlock = (options: TipTapRichTextBlockFactoryOptions = {}): TipTapRichTextBlockInterface => {
    const editorOptions = createEditorOptions(options);
    const linkBlock = options.link;
    const childBlocks = options.childBlocks ?? {};
    const childBlocksByKey: Record<string, BlockInterface> = Object.fromEntries(Object.entries(childBlocks).map(([key, { block }]) => [key, block]));
    const hasChildBlocks = Object.keys(childBlocks).length > 0;
    const emptyContent = createEmptyTipTapRichTextContent(editorOptions);

    const TipTapRichTextBlock: TipTapRichTextBlockInterface = {
        ...createBlockSkeleton(),

        name: "TipTapRichText",

        displayName: <FormattedMessage id="dextinity.blocks.tipTapRichText" defaultMessage="Rich Text (TipTap)" />,

        defaultValues: () => ({ tipTapContent: emptyContent }),

        category: BlockCategory.TextAndContent,

        input2State: ({ tipTapContent }) => {
            let content = tipTapContent ?? emptyContent;
            if (linkBlock) {
                content = mapLinkMarksData(content, (data) => linkBlock.input2State(data));
            }
            if (hasChildBlocks) {
                content = mapCmsBlockNodesData(content, (blockType, data) => childBlocksByKey[blockType]?.input2State(data) ?? data);
            }
            return { tipTapContent: content };
        },

        state2Output: ({ tipTapContent }) => {
            let content = tipTapContent;
            if (linkBlock) {
                content = mapLinkMarksData(content, (data) => linkBlock.state2Output(data));
            }
            if (hasChildBlocks) {
                content = mapCmsBlockNodesData(content, (blockType, data) => childBlocksByKey[blockType]?.state2Output(data) ?? data);
            }
            return { tipTapContent: content };
        },

        output2State: async ({ tipTapContent }, context) => {
            let content = tipTapContent ?? emptyContent;
            if (linkBlock) {
                content = await mapLinkMarksDataAsync(content, (data) => linkBlock.output2State(data, context));
            }
            if (hasChildBlocks) {
                content = await mapCmsBlockNodesDataAsync(content, async (blockType, data) =>
                    childBlocksByKey[blockType] ? childBlocksByKey[blockType].output2State(data, context) : data,
                );
            }
            return { tipTapContent: content };
        },

        createPreviewState: ({ tipTapContent }, previewCtx) => {
            let content = tipTapContent;
            if (linkBlock) {
                content = mapLinkMarksData(content, (data) => linkBlock.createPreviewState(data, previewCtx));
            }
            if (hasChildBlocks) {
                content = mapCmsBlockNodesData(
                    content,
                    (blockType, data) => childBlocksByKey[blockType]?.createPreviewState(data, previewCtx) ?? data,
                );
            }
            return {
                tipTapContent: content,
                adminMeta: { route: previewCtx.parentUrl },
            };
        },

        AdminComponent: ({ state, updateState }) => (
            <ChildBlocksContext.Provider value={childBlocksByKey}>
                <TipTapRichTextEditor
                    value={state.tipTapContent}
                    onChange={(tipTapContent) => updateState({ tipTapContent })}
                    options={editorOptions}
                />
            </ChildBlocksContext.Provider>
        ),

        ReadOnlyComponent: ({ state }) => (
            <ChildBlocksContext.Provider value={childBlocksByKey}>
                <TipTapRichTextEditor value={state.tipTapContent} options={editorOptions} readOnly />
            </ChildBlocksContext.Provider>
        ),

        previewContent: (state) => {
            const text = getTextLines(state.tipTapContent)
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .join(" ");
            const MAX_CHARS = 100;
            return text.length > 0 ? [{ type: "text", content: text.slice(0, MAX_CHARS) }] : [];
        },

        extractTextContents: (state, options) => {
            const texts: string[] = [];
            const text = getPlainTextFromContent(state.tipTapContent);
            if (text.length > 0) {
                texts.push(text);
            }
            if (linkBlock?.extractTextContents) {
                for (const data of collectLinkMarksData(state.tipTapContent)) {
                    texts.push(...linkBlock.extractTextContents(data, options));
                }
            }
            if (hasChildBlocks) {
                for (const { blockType, data } of collectCmsBlockNodes(state.tipTapContent)) {
                    const childBlock = childBlocksByKey[blockType];
                    if (childBlock?.extractTextContents) {
                        texts.push(...childBlock.extractTextContents(data, options));
                    }
                }
            }
            return texts;
        },

        translateContent: async (state, translate) => {
            const content = await translateTipTapRichTextContent(state.tipTapContent, translate, editorOptions);
            return { tipTapContent: content };
        },
    };

    return TipTapRichTextBlock;
};
