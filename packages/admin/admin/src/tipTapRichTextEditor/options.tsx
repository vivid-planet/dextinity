import type { SvgIconProps } from "@mui/material";
import type { Extensions, JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import type { ComponentType, Dispatch, ForwardRefExoticComponent, HTMLAttributes, ReactNode, RefAttributes, SetStateAction } from "react";
import { FormattedMessage } from "react-intl";

import { resolveTextAlign, type TipTapTextAlign } from "./extensions/textBlockAttributes";
import {
    allHeadingLevels,
    findDefaultTextBlock,
    hasParagraphTextBlock,
    orderedListName,
    resolveList,
    resolveTextBlocks,
    type TipTapListOptions,
    type TipTapResolvedList,
    type TipTapResolvedTextBlock,
    type TipTapTextBlock,
    unorderedListName,
} from "./textBlocks";

export interface TipTapInlineStyle {
    name: string;
    label: ReactNode;
    /**
     * Limits the inline style to the named text blocks, `"ordered-list"` and `"unordered-list"`.
     * If none is specified, the inline style is allowed everywhere.
     */
    appliesTo?: string[];
    element: ComponentType<HTMLAttributes<HTMLElement>>;
    /**
     * Displayed next to the label in the toolbar's "More options" menu, matching Superscript/Subscript.
     */
    icon?: ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export interface TipTapPlaceholder {
    name: string;
    label: ReactNode;
}

export interface TipTapRichTextEditorLinkFormProps<LinkData = unknown> {
    data: LinkData;
    onChange: Dispatch<SetStateAction<LinkData>>;
}

/**
 * Enables links. The editor stores the data the link form produces in the content's link marks,
 * so it decides what a link is, e.g. a URL or a reference to a page.
 */
export interface TipTapRichTextEditorLink<LinkData = unknown> {
    /**
     * The data a new link starts with.
     */
    createInitialData: () => LinkData;
    /**
     * The form in the link dialog that edits a link's data.
     */
    Form: ComponentType<TipTapRichTextEditorLinkFormProps<LinkData>>;
    /**
     * Translates the text a link's data holds, e.g. a link title. The content translation leaves the
     * data unchanged without it.
     */
    translateData?: (data: LinkData, translate: (text: string) => Promise<string>) => Promise<LinkData>;
}

export interface TipTapRichTextEditorToolbarItemsProps {
    editor: Editor;
}

export interface TipTapRichTextEditorOptions {
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
     * The text block types the editor's text block type select offers, in the order it offers them.
     * Defaults to a paragraph plus a heading for every level.
     *
     * Several text blocks may share a `tag`, for instance a "Display" heading-1 variant next to a
     * plain "Heading 1". Leave the `p` text block out for a heading-only editor (e.g. a headline);
     * that also disables lists, because a list item's content starts with a paragraph.
     *
     * Must match the API's `textBlocks`, otherwise the API rejects content the editor produces.
     */
    textBlocks?: TipTapTextBlock[];
    /**
     * Name of the text block new content starts with. Defaults to the first text block, so the
     * order of the type select can be chosen independently. Must be one of `textBlocks`, otherwise
     * an error is thrown.
     */
    defaultTextBlock?: string;
    /**
     * Enables ordered lists. Defaults to `true`. Pass `{ styles }` or `{ element }` to control how a
     * list item's content is rendered, the same way a text block does.
     */
    orderedList?: boolean | TipTapListOptions;
    /**
     * Enables unordered lists. Defaults to `true`. Pass `{ styles }` or `{ element }` to control how
     * a list item's content is rendered, the same way a text block does.
     */
    unorderedList?: boolean | TipTapListOptions;
    /**
     * Enables aligning text blocks left, center, right or justified. Defaults to `false`. Pass an
     * object such as `{ left: true, center: true }` to enable only some of the alignments.
     *
     * Must match the API's `textAlign`, otherwise the API rejects content the editor produces.
     */
    textAlign?: boolean | Partial<Record<TipTapTextAlign, boolean>>;
    /**
     * Enables non-breaking spaces. Defaults to `true`.
     */
    nonBreakingSpace?: boolean;
    /**
     * Enables soft hyphens. Defaults to `true`.
     */
    softHyphen?: boolean;
    /**
     * Enables links. Disabled by default.
     */

    link?: TipTapRichTextEditorLink<any>;
    /**
     * Shows the in-toolbar "Translate" button. Defaults to `true`. Set to `false` to hide it, e.g.
     * to avoid a nested translate button when this editor is rendered inside another translation UI.
     */
    contentTranslation?: boolean;
    inlineStyles?: TipTapInlineStyle[];
    placeholders?: TipTapPlaceholder[];
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
    /**
     * Additional TipTap extensions, e.g. for custom nodes. The API must know the nodes and marks they
     * add, otherwise it rejects content the editor produces.
     */
    extensions?: Extensions;
    /**
     * Rendered as the last group of the toolbar, e.g. to insert the custom nodes added by `extensions`.
     */
    toolbarItems?: ComponentType<TipTapRichTextEditorToolbarItemsProps>;
    /**
     * Translates the `data` attribute of the custom nodes added by `extensions`. The content
     * translation translates the text of the content as HTML, which leaves a node's data unchanged.
     */
    translateNodeData?: (node: JSONContent, translate: (text: string) => Promise<string>) => Promise<unknown>;
}

/**
 * The editor's options with the defaults applied and the text blocks validated.
 */
export interface TipTapResolvedOptions {
    undoRedoButtons: boolean;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    sub: boolean;
    sup: boolean;
    textBlocks: TipTapResolvedTextBlock[];
    /**
     * The text block new content starts with, and - for a schema without a paragraph text block -
     * the schema's default block type.
     */
    defaultTextBlock: TipTapResolvedTextBlock;
    orderedList: false | TipTapResolvedList;
    unorderedList: false | TipTapResolvedList;
    textAlign: TipTapTextAlign[];
    nonBreakingSpace: boolean;
    softHyphen: boolean;

    link: TipTapRichTextEditorLink<any> | undefined;
    contentTranslation: boolean;
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    maxTextBlocks: number | undefined;
    listLevelMax: number | undefined;
    minHeight: number;
    extensions: Extensions;
    toolbarItems: ComponentType<TipTapRichTextEditorToolbarItemsProps> | undefined;
    translateNodeData: TipTapRichTextEditorOptions["translateNodeData"];
}

const defaultTextBlocks: TipTapTextBlock[] = [
    {
        name: "paragraph",
        tag: "p",
        label: <FormattedMessage id="dextinity.tipTapRichTextEditor.textBlock.paragraph" defaultMessage="Paragraph" />,
    },
    ...allHeadingLevels.map((level) => ({
        name: `heading-${level}`,
        tag: `h${level}` as const,
        label: <FormattedMessage id="dextinity.tipTapRichTextEditor.textBlock.heading" defaultMessage="Heading {level}" values={{ level }} />,
    })),
];

export function resolveTipTapOptions({
    undoRedoButtons = true,
    bold = true,
    italic = true,
    underline = false,
    strike = true,
    sub = true,
    sup = true,
    textBlocks = defaultTextBlocks,
    defaultTextBlock,
    orderedList,
    unorderedList,
    textAlign = false,
    nonBreakingSpace = true,
    softHyphen = true,
    link,
    contentTranslation = true,
    inlineStyles = [],
    placeholders = [],
    maxTextBlocks,
    listLevelMax,
    minHeight = 200,
    extensions = [],
    toolbarItems,
    translateNodeData,
}: TipTapRichTextEditorOptions = {}): TipTapResolvedOptions {
    const resolvedTextBlocks = resolveTextBlocks(textBlocks);
    const hasParagraph = hasParagraphTextBlock(resolvedTextBlocks);

    if (!hasParagraph && (orderedList || unorderedList)) {
        throw new Error("Lists require a text block with the tag p, because a list item's content starts with a paragraph");
    }

    return {
        undoRedoButtons,
        bold,
        italic,
        underline,
        strike,
        sub,
        sup,
        textBlocks: resolvedTextBlocks,
        defaultTextBlock: findDefaultTextBlock({ textBlocks: resolvedTextBlocks, defaultTextBlock }),
        // Lists are enabled by default, but cannot exist without a paragraph to build their items from.
        orderedList: resolveList({ list: orderedList ?? hasParagraph, name: orderedListName, tag: "ol" }),
        unorderedList: resolveList({ list: unorderedList ?? hasParagraph, name: unorderedListName, tag: "ul" }),
        textAlign: resolveTextAlign(textAlign),
        nonBreakingSpace,
        softHyphen,
        link,
        contentTranslation,
        inlineStyles,
        placeholders,
        maxTextBlocks,
        listLevelMax,
        minHeight,
        extensions,
        toolbarItems,
        translateNodeData,
    };
}
