import { greyPalette } from "@dextinity/admin";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Extension } from "@tiptap/core";
import type { Level as HeadingLevel } from "@tiptap/extension-heading";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type ComponentType, type HTMLAttributes, type ReactNode, useEffect } from "react";
import { FormattedMessage } from "react-intl";

import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface, type LinkBlockInterface, type ReadOnlyBlockRenderInterface } from "../types";
import { ChildBlocksContext } from "./ChildBlocksContext";
import { CmsBlock, CmsInlineBlock } from "./extensions/CmsBlock";
import { CmsLink } from "./extensions/CmsLink";
import { InlineStyleMark } from "./extensions/InlineStyleMark";
import { NonBreakingSpace } from "./extensions/NonBreakingSpace";
import { Placeholder } from "./extensions/Placeholder";
import { SoftHyphen } from "./extensions/SoftHyphen";
import { TextBlockStyleHeading } from "./extensions/TextBlockStyleHeading";
import { TextBlockStyleParagraph } from "./extensions/TextBlockStyleParagraph";
import { InlineStyleContext } from "./InlineStyleContext";
import { createListLevelMaxExtension, getListNestingDepthFromJson, trimListNesting } from "./listLevelMaxHelpers";
import { TextBlockStyleContext } from "./TextBlockStyleContext";
import { TipTapToolbar } from "./TipTapToolbar";

export type TipTapSupports =
    | "history"
    | "bold"
    | "italic"
    | "underline"
    | "strike"
    | "sub"
    | "sup"
    | "heading"
    | "ordered-list"
    | "unordered-list"
    | "non-breaking-space"
    | "soft-hyphen"
    | "link";

const defaultSupports: TipTapSupports[] = [
    "history",
    "heading",
    "bold",
    "italic",
    "strike",
    "sub",
    "sup",
    "ordered-list",
    "unordered-list",
    "non-breaking-space",
    "soft-hyphen",
];

export type { JSONContent as TipTapRichTextBlockContent } from "@tiptap/core";

export type TipTapTextBlockType =
    | "paragraph"
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "heading-5"
    | "heading-6"
    | "ordered-list"
    | "unordered-list";

export interface TipTapTextBlockStyle {
    name: string;
    label: ReactNode;
    /**
     * Limits the text block style to the provided text block types.
     * If none is specified, the text block style is allowed for all text block types.
     */
    appliesTo?: TipTapTextBlockType[];
    element: ComponentType<HTMLAttributes<HTMLElement>>;
}

export interface TipTapInlineStyle {
    name: string;
    label: ReactNode;
    /**
     * Limits the inline style to the provided text block types.
     * If none is specified, the inline style is allowed for all text block types.
     */
    appliesTo?: TipTapTextBlockType[];
    element: ComponentType<HTMLAttributes<HTMLElement>>;
}

export interface TipTapRichTextBlockState {
    tipTapContent: JSONContent;
}

interface TipTapRichTextBlockData {
    tipTapContent: JSONContent;
}

interface TipTapRichTextBlockInput {
    tipTapContent: JSONContent;
}

export interface TipTapPlaceholder {
    name: string;
    label: ReactNode;
}

export interface TipTapChildBlock {
    block: BlockInterface;
    /**
     * How the child block is displayed in the editor (and rendered output): as a standalone block
     * element on its own line (`"block"`) or inline within the surrounding text (`"inline"`).
     */
    display: "block" | "inline";
}

interface TipTapRichTextBlockFactoryOptions {
    supports?: TipTapSupports[];
    textBlockStyles?: TipTapTextBlockStyle[];
    inlineStyles?: TipTapInlineStyle[];
    placeholders?: TipTapPlaceholder[];
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
    /**
     * Limits the maximum number of top-level text blocks (paragraphs, headings, lists)
     * that can be created in the editor.
     */
    maxTextBlocks?: number;
    /**
     * Limits the maximum nesting depth of list items.
     * A value of 1 means only a flat list (no nesting), 2 allows one level of sub-lists, etc.
     */
    listLevelMax?: number;
    /**
     * Limits the selectable heading levels (1-6). Defaults to all levels ([1, 2, 3, 4, 5, 6]).
     */
    headingLevels?: number[];
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

const emptyContent: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

const isCmsBlockNode = (content: JSONContent): boolean => content.type === "cmsBlock" || content.type === "cmsInlineBlock";

const createMaxTextBlocksExtension = (maxTextBlocks: number) =>
    Extension.create({
        name: "maxTextBlocks",
        addKeyboardShortcuts() {
            return {
                Enter: ({ editor }) => {
                    if (editor.state.doc.childCount >= maxTextBlocks) {
                        // Only block Enter when it would create a new text block (not inside a list, etc.)
                        const { $from } = editor.state.selection;
                        const isAtEndOfBlock = $from.parentOffset === $from.parent.content.size;
                        const parentDepth = $from.depth;
                        // If at end of a top-level text block (depth 1) or would split a top-level text block
                        if (parentDepth === 1 && isAtEndOfBlock) {
                            return true; // prevent
                        }
                    }
                    return false;
                },
            };
        },
    });

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

async function translateTextNodesAsync(content: JSONContent, translate: (text: string) => Promise<string>): Promise<JSONContent> {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (typeof result.text === "string" && result.text.trim().length > 0) {
        result.text = await translate(result.text);
    }

    if (Array.isArray(result.content)) {
        result.content = await Promise.all(result.content.map((child) => translateTextNodesAsync(child, translate)));
    }

    return result;
}

const ReadOnlyContent = styled("div")({
    ".tiptap > :first-child, .tiptap > :first-child > :first-child": {
        marginTop: 0,
    },

    ".tiptap > :last-child, .tiptap > :last-child > :last-child": {
        marginBottom: 0,
    },
});

const TipTapEditor = ({
    state,
    updateState,
    supports,
    textBlockStyles,
    inlineStyles,
    placeholders,
    linkBlock,
    childBlocks,
    maxTextBlocks,
    listLevelMax,
    headingLevels,
    readOnly,
}: {
    state: TipTapRichTextBlockState;
    updateState: React.Dispatch<React.SetStateAction<TipTapRichTextBlockState>>;
    supports: TipTapSupports[];
    textBlockStyles: TipTapTextBlockStyle[];
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    linkBlock?: BlockInterface & LinkBlockInterface;
    childBlocks: Record<string, TipTapChildBlock>;
    maxTextBlocks?: number;
    listLevelMax?: number;
    headingLevels?: number[];
    readOnly?: boolean;
}) => {
    const hasTextBlockStyles = textBlockStyles.length > 0;
    const hasInlineStyles = inlineStyles.length > 0;
    const hasLink = supports.includes("link") && !!linkBlock;
    const hasPlaceholders = placeholders.length > 0;
    const childBlockEntries = Object.values(childBlocks);
    const hasBlockChildBlocks = childBlockEntries.some((childBlock) => childBlock.display === "block");
    const hasInlineChildBlocks = childBlockEntries.some((childBlock) => childBlock.display === "inline");
    const childBlocksByKey: Record<string, BlockInterface> = Object.fromEntries(Object.entries(childBlocks).map(([key, { block }]) => [key, block]));

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: supports.includes("bold") ? {} : false,
                italic: supports.includes("italic") ? {} : false,
                underline: supports.includes("underline") ? {} : false,
                strike: supports.includes("strike") ? {} : false,
                heading: supports.includes("heading")
                    ? hasTextBlockStyles
                        ? false
                        : headingLevels
                          ? { levels: headingLevels as HeadingLevel[] }
                          : {}
                    : false,
                paragraph: hasTextBlockStyles ? false : undefined,
                orderedList: supports.includes("ordered-list") ? {} : false,
                bulletList: supports.includes("unordered-list") ? {} : false,
                blockquote: false,
                code: false,
                codeBlock: false,
                link: false,
            }),
            ...(hasTextBlockStyles ? [TextBlockStyleParagraph] : []),
            ...(hasTextBlockStyles && supports.includes("heading")
                ? [TextBlockStyleHeading.configure(headingLevels ? { levels: headingLevels as HeadingLevel[] } : {})]
                : []),
            ...(hasInlineStyles ? [InlineStyleMark] : []),
            ...(supports.includes("sup") ? [Superscript] : []),
            ...(supports.includes("sub") ? [Subscript] : []),
            ...(supports.includes("non-breaking-space") ? [NonBreakingSpace] : []),
            ...(supports.includes("soft-hyphen") ? [SoftHyphen] : []),
            ...(hasPlaceholders ? [Placeholder] : []),
            ...(hasLink ? [CmsLink] : []),
            ...(hasBlockChildBlocks ? [CmsBlock] : []),
            ...(hasInlineChildBlocks ? [CmsInlineBlock] : []),
            ...(maxTextBlocks !== undefined ? [createMaxTextBlocksExtension(maxTextBlocks)] : []),
            ...(listLevelMax !== undefined ? [createListLevelMaxExtension(listLevelMax)] : []),
        ],
        content: state.tipTapContent,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            if (maxTextBlocks !== undefined && editor.state.doc.childCount > maxTextBlocks) {
                // Remove excess text blocks (e.g. from paste)
                const { tr } = editor.state;
                const doc = editor.state.doc;
                // Find the resolved position after the maxTextBlocks-th child
                let pos = 0;
                for (let i = 0; i < maxTextBlocks; i++) {
                    pos += doc.child(i).nodeSize;
                }
                // In ProseMirror, doc content positions are offset by 1 (for the doc open token)
                // Delete from after the last allowed text block to end of doc content
                tr.delete(pos + 1, doc.content.size + 1);
                editor.view.dispatch(tr);
                return;
            }

            if (listLevelMax !== undefined) {
                const json = editor.getJSON();
                const currentDepth = getListNestingDepthFromJson(json);
                if (currentDepth > listLevelMax) {
                    // Trim nested lists that exceed the limit (e.g. from paste)
                    const trimmed = trimListNesting(json, listLevelMax);
                    editor.commands.setContent(trimmed);
                    return;
                }
            }

            updateState({ tipTapContent: editor.getJSON() });
        },
    });

    // useEditor sets content once, at creation, then ignores it. Read-only content can change while
    // mounted (e.g. a grid row re-rendering), so it needs re-syncing here. Editable content doesn't:
    // typing already keeps state.tipTapContent in sync, and re-syncing would reset the caret.
    useEffect(() => {
        if (readOnly && editor) {
            editor.commands.setContent(state.tipTapContent, { emitUpdate: false });
        }
    }, [readOnly, editor, state.tipTapContent]);

    if (!editor) {
        return null;
    }

    const editorNode = <EditorContent editor={editor} />;

    return (
        <TextBlockStyleContext.Provider value={textBlockStyles}>
            <InlineStyleContext.Provider value={inlineStyles}>
                <ChildBlocksContext.Provider value={childBlocksByKey}>
                    {readOnly ? (
                        <ReadOnlyContent>{editorNode}</ReadOnlyContent>
                    ) : (
                        <Box sx={{ border: `1px solid ${greyPalette[100]}`, borderTopWidth: 0, backgroundColor: "white", borderRadius: "2px" }}>
                            <TipTapToolbar
                                editor={editor}
                                supports={supports}
                                textBlockStyles={textBlockStyles}
                                inlineStyles={inlineStyles}
                                placeholders={placeholders}
                                linkBlock={linkBlock}
                                childBlocks={childBlocks}
                                listLevelMax={listLevelMax}
                                headingLevels={headingLevels}
                            />
                            <Box sx={{ "& .tiptap": { minHeight: 200, p: "20px", outline: "none" } }}>{editorNode}</Box>
                        </Box>
                    )}
                </ChildBlocksContext.Provider>
            </InlineStyleContext.Provider>
        </TextBlockStyleContext.Provider>
    );
};

type TipTapRichTextBlockInterface = BlockInterface<TipTapRichTextBlockData, TipTapRichTextBlockState, TipTapRichTextBlockInput> &
    ReadOnlyBlockRenderInterface<TipTapRichTextBlockState>;

/**
 * @experimental
 */
export const createTipTapRichTextBlock = (options?: TipTapRichTextBlockFactoryOptions): TipTapRichTextBlockInterface => {
    let supports = options?.supports ?? defaultSupports;
    const textBlockStyles = options?.textBlockStyles ?? [];
    const inlineStyles = options?.inlineStyles ?? [];
    const placeholders = options?.placeholders ?? [];
    const linkBlock = options?.link;
    const childBlocks = options?.childBlocks ?? {};
    const childBlocksByKey: Record<string, BlockInterface> = Object.fromEntries(Object.entries(childBlocks).map(([key, { block }]) => [key, block]));
    const hasChildBlocks = Object.keys(childBlocks).length > 0;
    const maxTextBlocks = options?.maxTextBlocks;
    const listLevelMax = options?.listLevelMax;
    const headingLevels = options?.headingLevels;

    // Auto-enable link support when a link block is provided
    if (linkBlock && !supports.includes("link")) {
        supports = [...supports, "link"];
    }

    const sharedEditorProps = {
        supports,
        textBlockStyles,
        inlineStyles,
        placeholders,
        linkBlock,
        childBlocks,
        maxTextBlocks,
        listLevelMax,
        headingLevels,
    };

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

        AdminComponent: ({ state, updateState }) => <TipTapEditor state={state} updateState={updateState} {...sharedEditorProps} />,

        ReadOnlyComponent: ({ state }) => <TipTapEditor state={state} updateState={() => {}} {...sharedEditorProps} readOnly />,

        previewContent: (state) => {
            const text = getPlainTextFromContent(state.tipTapContent);
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
            let content = await translateTextNodesAsync(state.tipTapContent, translate);
            if (linkBlock?.translateContent) {
                const translateLinkContent = linkBlock.translateContent;
                content = await mapLinkMarksDataAsync(content, (data) => translateLinkContent(data, translate));
            }
            if (hasChildBlocks) {
                content = await mapCmsBlockNodesDataAsync(content, async (blockType, data) => {
                    const childBlock = childBlocksByKey[blockType];
                    return childBlock?.translateContent ? childBlock.translateContent(data, translate) : data;
                });
            }
            return { tipTapContent: content };
        },
    };

    return TipTapRichTextBlock;
};
