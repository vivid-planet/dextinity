import { greyPalette, useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import { Box, type SvgIconProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Extension, type Extensions } from "@tiptap/core";
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
import { createTextBlockHeading } from "./extensions/TextBlockHeading";
import { createTextBlockParagraph } from "./extensions/TextBlockParagraph";
import { createTextBlockShortcuts } from "./extensions/TextBlockShortcuts";
import { InlineStyleContext } from "./InlineStyleContext";
import { createListLevelMaxExtension, getListNestingDepthFromJson, trimListNesting } from "./listLevelMaxHelpers";
import { TextBlockContext } from "./TextBlockContext";
import {
    findDefaultTextBlock,
    getHeadingLevels,
    getParagraphTextBlocks,
    orderedListName,
    resolveList,
    resolveTextBlocks,
    type TipTapResolvedList,
    type TipTapResolvedTextBlock,
    type TipTapStyledTag,
    type TipTapStyleOptions,
    type TipTapTextBlock,
    unorderedListName,
} from "./textBlocks";
import { TipTapContentTranslationDialog } from "./TipTapContentTranslationDialog";
import { TipTapToolbar } from "./TipTapToolbar";

export type { JSONContent as TipTapRichTextBlockContent } from "@tiptap/core";

/**
 * The block's options with the defaults applied and the text blocks validated.
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
    defaultTextBlock: TipTapResolvedTextBlock;
    orderedList: false | TipTapResolvedList;
    unorderedList: false | TipTapResolvedList;
    nonBreakingSpace: boolean;
    softHyphen: boolean;
    link: boolean;
    contentTranslation: boolean;
}

const defaultTextBlocks: TipTapTextBlock[] = [
    {
        name: "paragraph",
        tag: "p",
        label: <FormattedMessage id="dextinity.blocks.tipTapRichText.textBlockType.paragraph" defaultMessage="Paragraph" />,
    },
    ...([1, 2, 3, 4, 5, 6] as const).map(
        (level): TipTapTextBlock => ({
            name: `heading-${level}`,
            tag: `h${level}`,
            label: (
                <FormattedMessage id="dextinity.blocks.tipTapRichText.textBlockType.heading" defaultMessage="Heading {level}" values={{ level }} />
            ),
        }),
    ),
];

function resolveTipTapOptions({
    undoRedoButtons = true,
    bold = true,
    italic = true,
    underline = false,
    strike = true,
    sub = true,
    sup = true,
    textBlocks = defaultTextBlocks,
    defaultTextBlock,
    textBlockStyles = [],
    orderedList,
    unorderedList,
    nonBreakingSpace = true,
    softHyphen = true,
    link,
    contentTranslation = true,
}: TipTapRichTextBlockFactoryOptions = {}): TipTapResolvedOptions {
    const styleNames = textBlockStyles.map(({ name }) => name);
    const resolvedTextBlocks = resolveTextBlocks({ textBlocks, styleNames });
    const hasParagraph = getParagraphTextBlocks(resolvedTextBlocks).length > 0;

    if (!hasParagraph && (orderedList || unorderedList)) {
        throw new Error("Lists require a paragraph text block, because a list item's content starts with a paragraph");
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
        orderedList: resolveList({ list: orderedList ?? hasParagraph, name: orderedListName, tag: "ol", styleNames }),
        unorderedList: resolveList({ list: unorderedList ?? hasParagraph, name: unorderedListName, tag: "ul", styleNames }),
        nonBreakingSpace,
        softHyphen,
        link: !!link,
        contentTranslation,
    };
}

/**
 * Props a text block style's `element` must spread onto the element it renders.
 */
export interface TipTapTextBlockStyleProps extends HTMLAttributes<HTMLElement> {
    "data-text-block-style"?: string;
}

export interface TipTapTextBlockStyle {
    name: string;
    label: ReactNode;
    /**
     * Renders the styled text block. Receives the `tag` of the text block (or of the list) the
     * style is applied to, so one style can be shared by several text blocks:
     * `(props, Tag) => <Tag {...props} />`.
     */
    element: (props: TipTapTextBlockStyleProps, tag: TipTapStyledTag) => ReactNode;
}

export interface TipTapInlineStyle {
    name: string;
    label: ReactNode;
    /**
     * Limits the inline style to the provided text blocks (by `name`), `ordered-list` or
     * `unordered-list`. If none is specified, the inline style is allowed everywhere.
     */
    appliesTo?: string[];
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
     * The text block types the editor offers in its text block type select, in that order.
     * Defaults to a paragraph plus a heading for every level (`paragraph`, `heading-1` …
     * `heading-6`).
     *
     * Each text block is stored as the node its `tag` implies (`p` → paragraph, `h1`-`h6` → heading
     * of that level) and carries its `name` in the content, so several text blocks may share a tag.
     *
     * Leaving out the paragraph results in a heading-only block (e.g. a headline), which disables
     * lists, because a list item's content starts with a paragraph.
     */
    textBlocks?: TipTapTextBlock[];
    /**
     * Name of the text block the editor starts an empty block with. Defaults to the first text
     * block.
     */
    defaultTextBlock?: string;
    /**
     * Enables ordered lists. Defaults to `true`.
     * Pass an options object to configure the `styles` and the `defaultStyle` a list's content
     * offers, like a text block does.
     */
    orderedList?: boolean | TipTapStyleOptions;
    /**
     * Enables unordered lists. Defaults to `true`.
     * Pass an options object to configure the `styles` and the `defaultStyle` a list's content
     * offers, like a text block does.
     */
    unorderedList?: boolean | TipTapStyleOptions;
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

/**
 * An empty document holding the default text block with its default style applied.
 */
const buildEmptyContent = ({ defaultTextBlock: textBlock }: TipTapResolvedOptions): JSONContent => {
    return {
        type: "doc",
        content: [
            {
                type: textBlock.level !== undefined ? "heading" : "paragraph",
                attrs: {
                    textBlock: textBlock.name,
                    ...(textBlock.level !== undefined ? { level: textBlock.level } : {}),
                    ...(textBlock.defaultStyle !== null ? { textBlockStyle: textBlock.defaultStyle } : {}),
                },
            },
        ],
    };
};

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
    textBlockStyles,
    inlineStyles,
    placeholders,
    linkBlock,
    childBlocks,
    maxTextBlocks,
    listLevelMax,
}: {
    resolvedOptions: TipTapResolvedOptions;
    textBlockStyles: TipTapTextBlockStyle[];
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    linkBlock?: BlockInterface & LinkBlockInterface;
    childBlocks: Record<string, TipTapChildBlock>;
    maxTextBlocks?: number;
    listLevelMax?: number;
}): Extensions {
    const styled = textBlockStyles.length > 0;
    const hasInlineStyles = inlineStyles.length > 0;
    const hasLink = resolvedOptions.link && !!linkBlock;
    const hasPlaceholders = placeholders.length > 0;
    const childBlockEntries = Object.values(childBlocks);
    const hasBlockChildBlocks = childBlockEntries.some((childBlock) => childBlock.display === "block");
    const hasInlineChildBlocks = childBlockEntries.some((childBlock) => childBlock.display === "inline");
    const hasParagraph = getParagraphTextBlocks(resolvedOptions.textBlocks).length > 0;
    const headingLevels = getHeadingLevels(resolvedOptions.textBlocks);

    return [
        StarterKit.configure({
            bold: resolvedOptions.bold ? {} : false,
            italic: resolvedOptions.italic ? {} : false,
            underline: resolvedOptions.underline ? {} : false,
            strike: resolvedOptions.strike ? {} : false,
            // Paragraph and heading are added separately below to carry the text block attributes.
            heading: false,
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
        ...(hasParagraph ? [createTextBlockParagraph({ styled })] : []),
        ...(headingLevels.length > 0
            ? [
                  createTextBlockHeading({ defaultLevel: resolvedOptions.defaultTextBlock.level ?? headingLevels[0], styled })
                      // For a heading-only block, the heading takes the position paragraphs would otherwise
                      // hold by priority, making it the schema's default block type.
                      .extend(hasParagraph ? {} : { priority: paragraphPriority })
                      .configure({ levels: headingLevels }),
              ]
            : []),
        createTextBlockShortcuts({
            textBlocks: resolvedOptions.textBlocks,
            orderedList: resolvedOptions.orderedList,
            unorderedList: resolvedOptions.unorderedList,
        }),
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
        textBlockStyles,
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
        <TextBlockContext.Provider value={{ textBlocks: resolvedOptions.textBlocks, textBlockStyles }}>
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
        </TextBlockContext.Provider>
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
        textBlockStyles,
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
