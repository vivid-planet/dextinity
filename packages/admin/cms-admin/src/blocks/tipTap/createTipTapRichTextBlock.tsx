import { greyPalette, useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import { Box, type SvgIconProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Extension, type Extensions } from "@tiptap/core";
import type { Level as HeadingLevel } from "@tiptap/extension-heading";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    type ComponentType,
    type ForwardRefExoticComponent,
    type HTMLAttributes,
    type ReactNode,
    type RefAttributes,
    useEffect,
    useState,
} from "react";
import { FormattedMessage } from "react-intl";

import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface, type LinkBlockInterface, type ReadOnlyBlockRenderInterface } from "../types";
import { ChildBlocksContext } from "./ChildBlocksContext";
import { translateTipTapContent } from "./contentTranslation";
import { CmsBlock, CmsInlineBlock } from "./extensions/CmsBlock";
import { CmsLink } from "./extensions/CmsLink";
import { InlineStyleMark } from "./extensions/InlineStyleMark";
import { NonBreakingSpace } from "./extensions/NonBreakingSpace";
import { Placeholder } from "./extensions/Placeholder";
import { SoftHyphen } from "./extensions/SoftHyphen";
import { TextBlockHeading } from "./extensions/TextBlockHeading";
import { TextBlockParagraph } from "./extensions/TextBlockParagraph";
import { InlineStyleContext } from "./InlineStyleContext";
import { createListLevelMaxExtension, getListNestingDepthFromJson, trimListNesting } from "./listLevelMaxHelpers";
import { TextBlockStyleContext } from "./TextBlockStyleContext";
import { TipTapContentTranslationDialog } from "./TipTapContentTranslationDialog";
import { TipTapToolbar } from "./TipTapToolbar";

export type { JSONContent as TipTapRichTextBlockContent } from "@tiptap/core";

/**
 * The block's options with the defaults applied and `textBlocks` validated.
 */
export interface TipTapResolvedOptions {
    undoRedoButtons: boolean;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    sub: boolean;
    sup: boolean;
    textBlocks: TipTapTextBlock[];
    /**
     * The `textBlocks` entry used for new/empty content, and — for a heading-only schema (no
     * `paragraph`-tag entry) — the schema's default block type. Defaults to `textBlocks[0]`, but is
     * independent of `textBlocks` order, which only controls the type dropdown.
     */
    defaultTextBlock: TipTapTextBlock;
    /**
     * Names of `textBlockStyles` entries selectable for a list item, independent of `textBlocks`
     * since a list isn't a text block type of its own (it's toggled via a toolbar button, not the
     * type dropdown).
     */
    listStyles: string[];
    orderedList: boolean;
    unorderedList: boolean;
    nonBreakingSpace: boolean;
    softHyphen: boolean;
    link: boolean;
    contentTranslation: boolean;
}

const allHeadingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

function buildDefaultTextBlocks(): TipTapTextBlock[] {
    return [
        {
            name: "paragraph",
            tag: "paragraph",
            label: <FormattedMessage id="dextinity.blocks.tipTapRichText.textBlockType.paragraph" defaultMessage="Paragraph" />,
        },
        ...allHeadingLevels.map((level) => ({
            name: `heading-${level}`,
            tag: `heading-${level}` as TipTapTextBlockTag,
            label: (
                <FormattedMessage id="dextinity.blocks.tipTapRichText.textBlockType.heading" defaultMessage="Heading {level}" values={{ level }} />
            ),
        })),
    ];
}

const defaultTextBlocks: TipTapTextBlock[] = buildDefaultTextBlocks();

function getHeadingLevels(textBlocks: TipTapTextBlock[]): HeadingLevel[] {
    const levels = new Set<HeadingLevel>();
    for (const block of textBlocks) {
        if (block.tag !== "paragraph") {
            levels.add(Number(block.tag.slice("heading-".length)) as HeadingLevel);
        }
    }
    return [...levels].sort((a, b) => a - b);
}

function validateTextBlocks(textBlocks: TipTapTextBlock[], textBlockStyles: TipTapTextBlockStyle[], listStyles: string[]): void {
    if (textBlocks.length === 0) {
        throw new Error("textBlocks must not be empty");
    }

    const blockNames = new Set<string>();
    for (const block of textBlocks) {
        if (blockNames.has(block.name)) {
            throw new Error(`textBlocks has a duplicate name "${block.name}"`);
        }
        blockNames.add(block.name);
    }

    const styleNames = new Set<string>();
    for (const style of textBlockStyles) {
        if (styleNames.has(style.name)) {
            throw new Error(`textBlockStyles has a duplicate name "${style.name}"`);
        }
        styleNames.add(style.name);
    }

    const styleByName = new Map(textBlockStyles.map((style) => [style.name, style]));
    for (const block of textBlocks) {
        const styles = block.styles ?? [];
        for (const styleName of styles) {
            if (!styleNames.has(styleName)) {
                throw new Error(`textBlocks entry "${block.name}" references unknown text block style "${styleName}"`);
            }
        }
        if (block.defaultStyle !== undefined && !styles.includes(block.defaultStyle)) {
            throw new Error(`textBlocks entry "${block.name}" has defaultStyle "${block.defaultStyle}", which is not part of its styles`);
        }
        for (const styleName of styles) {
            if (styleByName.get(styleName)?.isTextBlockType && (styles.length !== 1 || block.defaultStyle !== styleName)) {
                throw new Error(
                    `textBlocks entry "${block.name}" uses "${styleName}" (isTextBlockType) alongside other styles or without it as defaultStyle — an isTextBlockType style must be the entry's only style and its defaultStyle`,
                );
            }
        }
    }

    for (const styleName of listStyles) {
        if (!styleNames.has(styleName)) {
            throw new Error(`listStyles references unknown text block style "${styleName}"`);
        }
    }
}

function resolveTipTapOptions({
    undoRedoButtons = true,
    bold = true,
    italic = true,
    underline = false,
    strike = true,
    sub = true,
    sup = true,
    textBlocks = defaultTextBlocks,
    defaultTextBlock: defaultTextBlockName,
    listStyles = [],
    orderedList,
    unorderedList,
    nonBreakingSpace = true,
    softHyphen = true,
    link,
    contentTranslation = true,
}: TipTapRichTextBlockFactoryOptions = {}): TipTapResolvedOptions {
    if (textBlocks.length === 0) {
        throw new Error("textBlocks must not be empty");
    }

    const defaultTextBlock = defaultTextBlockName !== undefined ? textBlocks.find((block) => block.name === defaultTextBlockName) : textBlocks[0];
    if (!defaultTextBlock) {
        throw new Error(`defaultTextBlock references unknown textBlocks entry "${defaultTextBlockName}"`);
    }

    const hasParagraph = textBlocks.some((block) => block.tag === "paragraph");
    if ((orderedList || unorderedList) && !hasParagraph) {
        throw new Error(`Lists require a textBlocks entry with tag "paragraph", because a list item's content starts with a paragraph`);
    }

    return {
        undoRedoButtons,
        bold,
        italic,
        underline,
        strike,
        sub,
        sup,
        textBlocks,
        defaultTextBlock,
        listStyles,
        // Lists are enabled by default, but cannot exist without a paragraph to build their items from.
        orderedList: orderedList ?? hasParagraph,
        unorderedList: unorderedList ?? hasParagraph,
        nonBreakingSpace,
        softHyphen,
        link: !!link,
        contentTranslation,
    };
}

// A text block's underlying TipTap node type/heading level. Lists are excluded: `textBlocks` entries
// only ever produce a `paragraph` or `heading` node, never a list.
export type TipTapTextBlockTag = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "heading-4" | "heading-5" | "heading-6";

// The broader set of block-level types inline styles can be limited to, including lists (a mark can
// sit inside a list item's paragraph).
export type TipTapTextBlockType = TipTapTextBlockTag | "ordered-list" | "unordered-list";

export interface TipTapTextBlock {
    /**
     * Identifies this entry. Stored as the node's `textBlockName` attribute, so content can tell two
     * entries sharing the same `tag` apart (e.g. a "Display" heading-1 variant next to a plain
     * "Heading 1"). Must be unique across `textBlocks`.
     */
    name: string;
    /**
     * The underlying TipTap node type and, for a heading, its level. Multiple entries may share a tag.
     */
    tag: TipTapTextBlockTag;
    /**
     * Shown in the text block type dropdown, in `textBlocks` order.
     */
    label: ReactNode;
    /**
     * Names of `textBlockStyles` entries selectable for this text block. Omit, or pass an empty array,
     * for a text block that never shows a style choice.
     */
    styles?: string[];
    /**
     * Style applied automatically to a newly created or converted text block of this entry, and
     * restored when switching back to it. Must be one of `styles`, otherwise an error is thrown.
     */
    defaultStyle?: string;
}

export interface TipTapTextBlockStyle {
    name: string;
    label: ReactNode;
    element: ComponentType<HTMLAttributes<HTMLElement>>;
    /**
     * Marks this style as a text block's sole identity rather than a free choice among several — e.g.
     * a "Display" heading-1 variant. Has no effect unless it's the only entry in some `textBlocks`
     * entry's `styles` and that entry's `defaultStyle`: when it is, the toolbar hides that entry's
     * (otherwise pointless, single-option, unchangeable) style dropdown entirely.
     */
    isTextBlockType?: boolean;
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
    /**
     * Displayed next to the label in the toolbar's "More options" menu, matching Superscript/Subscript.
     */
    icon?: ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>;
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
    /**
     * Shows the undo/redo buttons in the toolbar. The keyboard shortcuts work regardless. Defaults to `true`.
     */
    undoRedoButtons?: boolean;
    /**
     * Enables bold text. Defaults to `true`.
     */
    bold?: boolean;
    /**
     * Enables italic text. Defaults to `true`.
     */
    italic?: boolean;
    /**
     * Enables underlined text. Defaults to `false`.
     */
    underline?: boolean;
    /**
     * Enables struck-through text. Defaults to `true`.
     */
    strike?: boolean;
    /**
     * Enables subscript text. Defaults to `true`.
     */
    sub?: boolean;
    /**
     * Enables superscript text. Defaults to `true`.
     */
    sup?: boolean;
    /**
     * Configures the selectable text blocks (paragraph and heading levels) shown in the toolbar's type
     * dropdown, in this order. Defaults to a plain paragraph plus headings 1-6. Requires at least one
     * entry, otherwise an error is thrown.
     *
     * Content of any tag not covered by an entry is rejected by the API. Omit `paragraph`-tag entries
     * to build a heading-only block (e.g. a headline): the editor starts with a heading instead of a
     * paragraph, and lists are disabled, since a list item's content starts with a paragraph.
     */
    textBlocks?: TipTapTextBlock[];
    /**
     * Name of the `textBlocks` entry used for new/empty content, and — for a heading-only schema —
     * the schema's default block type. Defaults to `textBlocks[0]`. Set this when the default
     * shouldn't also be the type dropdown's first entry (which is always just `textBlocks` order).
     * Throws if it doesn't reference a `textBlocks` entry.
     */
    defaultTextBlock?: string;
    /**
     * Names of `textBlockStyles` entries selectable for a list item. A list isn't covered by
     * `textBlocks`, since it's toggled via a toolbar button rather than chosen from the type dropdown.
     */
    listStyles?: string[];
    /**
     * Enables ordered lists. Defaults to `true` if a `textBlocks` entry with tag `"paragraph"` exists,
     * `false` otherwise. Throws if enabled without one.
     */
    orderedList?: boolean;
    /**
     * Enables unordered lists. Defaults to `true` if a `textBlocks` entry with tag `"paragraph"`
     * exists, `false` otherwise. Throws if enabled without one.
     */
    unorderedList?: boolean;
    /**
     * Enables non-breaking spaces. Defaults to `true`.
     */
    nonBreakingSpace?: boolean;
    /**
     * Enables soft hyphens. Defaults to `true`.
     */
    softHyphen?: boolean;
    /**
     * Enables links by passing the link block that is used for them. Disabled by default.
     */
    link?: BlockInterface & LinkBlockInterface;
    /**
     * Shows the in-toolbar "Translate" button. Defaults to `true`. Set to `false` to hide it, e.g.
     * to avoid a nested translate button when this block is rendered inside another translation UI.
     */
    contentTranslation?: boolean;
    textBlockStyles?: TipTapTextBlockStyle[];
    inlineStyles?: TipTapInlineStyle[];
    placeholders?: TipTapPlaceholder[];
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
     * Minimum height (in px) of the editor's content area. Defaults to `200`.
     */
    minHeight?: number;
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

// TipTap's own priority for the paragraph extension, which makes the paragraph the schema's first
// block node and therefore ProseMirror's default block type.
const paragraphPriority = 1000;

const buildEmptyContent = (resolvedOptions: TipTapResolvedOptions): JSONContent => {
    const defaultTextBlock = resolvedOptions.defaultTextBlock;
    const attrs: JSONContent["attrs"] = { textBlockName: defaultTextBlock.name };
    if (defaultTextBlock.defaultStyle !== undefined) {
        attrs.textBlockStyle = defaultTextBlock.defaultStyle;
    }
    if (defaultTextBlock.tag === "paragraph") {
        return { type: "doc", content: [{ type: "paragraph", attrs }] };
    }
    return {
        type: "doc",
        content: [{ type: "heading", attrs: { ...attrs, level: Number(defaultTextBlock.tag.slice("heading-".length)) } }],
    };
};

/**
 * Sets the default heading level and, for a heading-only schema (no `paragraph`-tag entry), makes
 * the heading the schema's default block type (the position paragraphs would otherwise take, by
 * priority) and replaces the heading keyboard shortcuts, which would otherwise toggle back to a
 * paragraph.
 */
const buildHeadingExtension = ({
    levels,
    defaultLevel,
    hasParagraph,
}: {
    levels: HeadingLevel[];
    defaultLevel: HeadingLevel;
    hasParagraph: boolean;
}) =>
    TextBlockHeading.extend({
        ...(hasParagraph
            ? {}
            : {
                  priority: paragraphPriority,
                  addKeyboardShortcuts() {
                      return Object.fromEntries(levels.map((level) => [`Mod-Alt-${level}`, () => this.editor.commands.setHeading({ level })]));
                  },
              }),
        addAttributes() {
            return {
                ...this.parent?.(),
                // `rendered: false` keeps TipTap from adding a `level` HTML attribute, the level is the tag name.
                level: { default: defaultLevel, rendered: false },
            };
        },
    }).configure({ levels });

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
export function mapLinkMarksData(content: JSONContent, fn: (data: any) => any): JSONContent {
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
export async function mapLinkMarksDataAsync(content: JSONContent, fn: (data: any) => Promise<any>): Promise<JSONContent> {
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
export function mapCmsBlockNodesData(content: JSONContent, fn: (blockType: string, data: any) => any): JSONContent {
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
export async function mapCmsBlockNodesDataAsync(content: JSONContent, fn: (blockType: string, data: any) => Promise<any>): Promise<JSONContent> {
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

function buildTipTapExtensions({
    resolvedOptions,
    inlineStyles,
    placeholders,
    linkBlock,
    childBlocks,
    maxTextBlocks,
    listLevelMax,
}: {
    resolvedOptions: TipTapResolvedOptions;
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    linkBlock?: BlockInterface & LinkBlockInterface;
    childBlocks: Record<string, TipTapChildBlock>;
    maxTextBlocks?: number;
    listLevelMax?: number;
}): Extensions {
    const { textBlocks, defaultTextBlock } = resolvedOptions;
    const hasParagraph = textBlocks.some((block) => block.tag === "paragraph");
    const headingLevels = getHeadingLevels(textBlocks);
    const hasHeadings = headingLevels.length > 0;
    // In a heading-only schema (the only case this matters for), defaultTextBlock's tag is always a
    // heading — no paragraph-tag entry exists to resolve to.
    const defaultHeadingLevel = hasParagraph ? headingLevels[0] : (Number(defaultTextBlock.tag.slice("heading-".length)) as HeadingLevel);
    const hasInlineStyles = inlineStyles.length > 0;
    const hasLink = resolvedOptions.link && !!linkBlock;
    const hasPlaceholders = placeholders.length > 0;
    const childBlockEntries = Object.values(childBlocks);
    const hasBlockChildBlocks = childBlockEntries.some((childBlock) => childBlock.display === "block");
    const hasInlineChildBlocks = childBlockEntries.some((childBlock) => childBlock.display === "inline");

    return [
        StarterKit.configure({
            bold: resolvedOptions.bold ? {} : false,
            italic: resolvedOptions.italic ? {} : false,
            underline: resolvedOptions.underline ? {} : false,
            strike: resolvedOptions.strike ? {} : false,
            // The heading extension is added separately below to set the default heading level.
            heading: false,
            // The paragraph extension is added separately below, it always needs `textBlockName`.
            paragraph: false,
            orderedList: resolvedOptions.orderedList ? {} : false,
            bulletList: resolvedOptions.unorderedList ? {} : false,
            // A list item's content starts with a paragraph, so lists cannot exist without one.
            listItem: hasParagraph ? undefined : false,
            listKeymap: hasParagraph ? undefined : false,
            blockquote: false,
            code: false,
            codeBlock: false,
            link: false,
            // A heading is directly editable (Enter at its end already creates a paragraph below it), so it
            // doesn't need TrailingNode's own empty paragraph the way a trailing atom node (e.g. a child block) does.
            trailingNode: { notAfter: ["heading"] },
        }),
        ...(hasParagraph ? [TextBlockParagraph] : []),
        ...(hasHeadings ? [buildHeadingExtension({ levels: headingLevels, defaultLevel: defaultHeadingLevel, hasParagraph })] : []),
        ...(hasInlineStyles ? [InlineStyleMark] : []),
        ...(resolvedOptions.sup ? [Superscript] : []),
        ...(resolvedOptions.sub ? [Subscript] : []),
        ...(resolvedOptions.nonBreakingSpace ? [NonBreakingSpace] : []),
        ...(resolvedOptions.softHyphen ? [SoftHyphen] : []),
        ...(hasPlaceholders ? [Placeholder] : []),
        ...(hasLink ? [CmsLink] : []),
        ...(hasBlockChildBlocks ? [CmsBlock] : []),
        ...(hasInlineChildBlocks ? [CmsInlineBlock] : []),
        ...(maxTextBlocks !== undefined ? [createMaxTextBlocksExtension(maxTextBlocks)] : []),
        ...(listLevelMax !== undefined ? [createListLevelMaxExtension(listLevelMax)] : []),
    ];
}

const ReadOnlyContent = styled("div")({
    ".tiptap > :first-child, .tiptap > :first-child > :first-child": {
        marginTop: 0,
    },

    ".tiptap > :last-child, .tiptap > :last-child > :last-child": {
        marginBottom: 0,
    },
});

export interface TipTapEditorProps {
    state: TipTapRichTextBlockState;
    updateState: React.Dispatch<React.SetStateAction<TipTapRichTextBlockState>>;
    resolvedOptions: TipTapResolvedOptions;
    textBlockStyles: TipTapTextBlockStyle[];
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    linkBlock?: BlockInterface & LinkBlockInterface;
    childBlocks: Record<string, TipTapChildBlock>;
    maxTextBlocks?: number;
    listLevelMax?: number;
    minHeight?: number;
    readOnly?: boolean;
}

export const TipTapEditor = ({
    state,
    updateState,
    resolvedOptions,
    textBlockStyles,
    inlineStyles,
    placeholders,
    linkBlock,
    childBlocks,
    maxTextBlocks,
    listLevelMax,
    minHeight = 200,
    readOnly,
}: TipTapEditorProps) => {
    const childBlocksByKey: Record<string, BlockInterface> = Object.fromEntries(Object.entries(childBlocks).map(([key, { block }]) => [key, block]));

    const extensions = buildTipTapExtensions({
        resolvedOptions,
        inlineStyles,
        placeholders,
        linkBlock,
        childBlocks,
        maxTextBlocks,
        listLevelMax,
    });

    const editor = useEditor({
        extensions,
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

    const translationContext = useContentTranslationService();
    const canTranslate = translationContext.enabled && resolvedOptions.contentTranslation;
    const [translationDialogState, setTranslationDialogState] = useState<{ original: JSONContent; translated: JSONContent } | null>(null);
    const errorDialog = useErrorDialog();

    if (!editor) {
        return null;
    }

    async function handleTranslateClick() {
        try {
            const original = editor.getJSON();
            const translated = await translateTipTapContent(original, translationContext.translate, {
                extensions,
                linkBlock,
                childBlocksByKey,
            });
            if (translationContext.showApplyTranslationDialog) {
                setTranslationDialogState({ original, translated });
            } else {
                editor.commands.setContent(translated);
            }
        } catch (error) {
            errorDialog?.showError({
                title: <FormattedMessage id="dextinity.translator.error.title" defaultMessage="Translation failed" />,
                userMessage: (
                    <FormattedMessage
                        id="dextinity.translator.error.message"
                        defaultMessage="An error occurred while translating the content. Please try again."
                    />
                ),
                error: error instanceof Error ? error.message : "Translation failed",
            });
        }
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
                                resolvedOptions={resolvedOptions}
                                textBlockStyles={textBlockStyles}
                                inlineStyles={inlineStyles}
                                placeholders={placeholders}
                                linkBlock={linkBlock}
                                childBlocks={childBlocks}
                                listLevelMax={listLevelMax}
                                canTranslate={canTranslate}
                                onTranslateClick={handleTranslateClick}
                            />
                            <Box sx={{ "& .tiptap": { minHeight, p: "20px", outline: "none" } }}>{editorNode}</Box>
                        </Box>
                    )}
                    {translationDialogState && (
                        <TipTapContentTranslationDialog
                            open
                            onClose={() => setTranslationDialogState(null)}
                            originalContent={translationDialogState.original}
                            translatedContent={translationDialogState.translated}
                            onApplyTranslation={(content) => {
                                editor.commands.setContent(content);
                                setTranslationDialogState(null);
                            }}
                            editorProps={{
                                resolvedOptions,
                                textBlockStyles,
                                inlineStyles,
                                placeholders,
                                linkBlock,
                                childBlocks,
                                maxTextBlocks,
                                listLevelMax,
                                minHeight,
                            }}
                        />
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
export const createTipTapRichTextBlock = (options: TipTapRichTextBlockFactoryOptions = {}): TipTapRichTextBlockInterface => {
    const resolvedOptions = resolveTipTapOptions(options);
    const textBlockStyles = options.textBlockStyles ?? [];
    validateTextBlocks(resolvedOptions.textBlocks, textBlockStyles, resolvedOptions.listStyles);
    const inlineStyles = options.inlineStyles ?? [];
    const placeholders = options.placeholders ?? [];
    const linkBlock = options.link;
    const childBlocks = options.childBlocks ?? {};
    const childBlocksByKey: Record<string, BlockInterface> = Object.fromEntries(Object.entries(childBlocks).map(([key, { block }]) => [key, block]));
    const hasChildBlocks = Object.keys(childBlocks).length > 0;
    const maxTextBlocks = options.maxTextBlocks;
    const listLevelMax = options.listLevelMax;
    const minHeight = options.minHeight;
    const emptyContent = buildEmptyContent(resolvedOptions);

    const sharedEditorProps = {
        resolvedOptions,
        textBlockStyles,
        inlineStyles,
        placeholders,
        linkBlock,
        childBlocks,
        maxTextBlocks,
        listLevelMax,
        minHeight,
    };

    const tipTapExtensions = buildTipTapExtensions({
        resolvedOptions,
        inlineStyles,
        placeholders,
        linkBlock,
        childBlocks,
        maxTextBlocks,
        listLevelMax,
    });

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
            const content = await translateTipTapContent(state.tipTapContent, translate, {
                extensions: tipTapExtensions,
                linkBlock,
                childBlocksByKey,
            });
            return { tipTapContent: content };
        },
    };

    return TipTapRichTextBlock;
};
