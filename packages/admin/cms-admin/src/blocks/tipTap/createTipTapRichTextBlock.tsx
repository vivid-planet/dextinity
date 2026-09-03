import { BaseTranslationDialog, greyPalette, useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Extension, type Extensions, generateHTML, generateJSON } from "@tiptap/core";
import type { Level as HeadingLevel } from "@tiptap/extension-heading";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type ComponentType, type HTMLAttributes, type ReactNode, useEffect, useState } from "react";
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
     * Must be a non-empty array of unique integers between 1 and 6, otherwise an error is thrown.
     */
    headingLevels?: number[];
    /**
     * Hides the in-toolbar "Translate" button, e.g. to avoid a nested translate button when this
     * block is rendered inside another translation UI.
     */
    disableContentTranslation?: boolean;
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

interface ExternalizedBlockData {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

// Unlike mapLinkMarksData (used elsewhere to skip marks that have no link data at all), this
// externalizes every link mark's data unconditionally, including falsy values (null, false, 0, "").
// setCmsLink's data is typed as `any`, so a falsy value isn't ruled out even though the only current
// caller (TipTapLinkDialog) always passes a populated object.
function externalizeLinkMarksForHtml(content: JSONContent, externalized: ExternalizedBlockData[]): JSONContent {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (Array.isArray(result.marks)) {
        result.marks = result.marks.map((mark) => {
            if (mark.type === "link") {
                const id = `placeholder-${externalized.length}`;
                externalized.push({ id, data: mark.attrs?.data });
                return { ...mark, attrs: { ...mark.attrs, data: id } };
            }
            return mark;
        });
    }

    if (Array.isArray(result.content)) {
        result.content = result.content.map((child) => externalizeLinkMarksForHtml(child, externalized));
    }

    return result;
}

// Link marks and child block nodes can carry arbitrary non-string `data` (link targets, block state).
// HTML serialization only round-trips string attribute values, so this data is swapped for a
// placeholder id before serializing and restored by id afterward. It never enters the translated HTML.
function externalizeBlockDataForHtml(content: JSONContent): { content: JSONContent; externalized: ExternalizedBlockData[] } {
    const externalized: ExternalizedBlockData[] = [];

    let result = externalizeLinkMarksForHtml(content, externalized);

    result = mapCmsBlockNodesData(result, (blockType, data) => {
        const id = `placeholder-${externalized.length}`;
        externalized.push({ id, data });
        return id;
    });

    return { content: result, externalized };
}

function restoreBlockDataFromHtml(content: JSONContent, externalized: ExternalizedBlockData[]): JSONContent {
    const dataById = new Map(externalized.map((item) => [item.id, item.data]));

    let result = mapLinkMarksData(content, (id) => (typeof id === "string" && dataById.has(id) ? dataById.get(id) : id));
    result = mapCmsBlockNodesData(result, (blockType, id) => (typeof id === "string" && dataById.has(id) ? dataById.get(id) : id));

    return result;
}

// Translates a field's content as a single HTML document (like the Draft.js rich text block does),
// instead of translating each text node in isolation. This keeps sentence context across marks (bold,
// links, ...) intact and results in one translation request per field instead of one per text node.
async function translateTipTapContentAsync(
    content: JSONContent,
    translate: (text: string) => Promise<string>,
    extensions: Extensions,
): Promise<JSONContent> {
    const { content: sanitizedContent, externalized } = externalizeBlockDataForHtml(content);
    const html = generateHTML(sanitizedContent, extensions);
    const translatedHtml = await translate(html);

    // `translate` is typed as an unconstrained string transformer, so nothing guarantees the
    // implementation leaves markup and attribute values alone (a naive one could, e.g., uppercase
    // the whole HTML string). Verify the placeholder ids survived verbatim before trusting the
    // result — restoring link/child-block data by a mangled id would otherwise silently corrupt it.
    const corruptedId = externalized.find((item) => !translatedHtml.includes(item.id));
    if (corruptedId) {
        throw new Error(
            "Translation result is missing an expected placeholder id. The translate function must preserve HTML markup and attribute values unchanged, translating only text content.",
        );
    }

    const translatedContent = generateJSON(translatedHtml, extensions) as JSONContent;
    return restoreBlockDataFromHtml(translatedContent, externalized);
}

function buildTipTapExtensions({
    supports,
    textBlockStyles,
    inlineStyles,
    placeholders,
    linkBlock,
    childBlocks,
    maxTextBlocks,
    listLevelMax,
    headingLevels,
}: {
    supports: TipTapSupports[];
    textBlockStyles: TipTapTextBlockStyle[];
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    linkBlock?: BlockInterface & LinkBlockInterface;
    childBlocks: Record<string, TipTapChildBlock>;
    maxTextBlocks?: number;
    listLevelMax?: number;
    headingLevels?: number[];
}): Extensions {
    const hasTextBlockStyles = textBlockStyles.length > 0;
    const hasInlineStyles = inlineStyles.length > 0;
    const hasLink = supports.includes("link") && !!linkBlock;
    const hasPlaceholders = placeholders.length > 0;
    const childBlockEntries = Object.values(childBlocks);
    const hasBlockChildBlocks = childBlockEntries.some((childBlock) => childBlock.display === "block");
    const hasInlineChildBlocks = childBlockEntries.some((childBlock) => childBlock.display === "inline");

    return [
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

interface TipTapEditorProps {
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
    disableContentTranslation?: boolean;
}

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
    disableContentTranslation,
}: TipTapEditorProps) => {
    const childBlocksByKey: Record<string, BlockInterface> = Object.fromEntries(Object.entries(childBlocks).map(([key, { block }]) => [key, block]));

    const extensions = buildTipTapExtensions({
        supports,
        textBlockStyles,
        inlineStyles,
        placeholders,
        linkBlock,
        childBlocks,
        maxTextBlocks,
        listLevelMax,
        headingLevels,
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
    const canTranslate = translationContext.enabled && !disableContentTranslation;
    const [translationDialogState, setTranslationDialogState] = useState<{ original: JSONContent; translated: JSONContent } | null>(null);
    const errorDialog = useErrorDialog();

    if (!editor) {
        return null;
    }

    async function handleTranslateClick() {
        try {
            const original = editor.getJSON();
            let translated = await translateTipTapContentAsync(original, translationContext.translate, extensions);
            if (linkBlock?.translateContent) {
                const translateLinkContent = linkBlock.translateContent;
                translated = await mapLinkMarksDataAsync(translated, (data) => translateLinkContent(data, translationContext.translate));
            }
            if (Object.keys(childBlocks).length > 0) {
                translated = await mapCmsBlockNodesDataAsync(translated, async (blockType, data) => {
                    const childBlock = childBlocksByKey[blockType];
                    return childBlock?.translateContent ? childBlock.translateContent(data, translationContext.translate) : data;
                });
            }
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
                                supports={supports}
                                textBlockStyles={textBlockStyles}
                                inlineStyles={inlineStyles}
                                placeholders={placeholders}
                                linkBlock={linkBlock}
                                childBlocks={childBlocks}
                                listLevelMax={listLevelMax}
                                headingLevels={headingLevels}
                                canTranslate={canTranslate}
                                onTranslateClick={handleTranslateClick}
                            />
                            <Box sx={{ "& .tiptap": { minHeight: 200, p: "20px", outline: "none" } }}>{editorNode}</Box>
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
                                supports,
                                textBlockStyles,
                                inlineStyles,
                                placeholders,
                                linkBlock,
                                childBlocks,
                                maxTextBlocks,
                                listLevelMax,
                                headingLevels,
                            }}
                        />
                    )}
                </ChildBlocksContext.Provider>
            </InlineStyleContext.Provider>
        </TextBlockStyleContext.Provider>
    );
};

interface TipTapContentTranslationDialogProps {
    open: boolean;
    onClose: () => void;
    originalContent: JSONContent;
    translatedContent: JSONContent;
    onApplyTranslation: (content: JSONContent) => void;
    editorProps: Pick<
        TipTapEditorProps,
        | "supports"
        | "textBlockStyles"
        | "inlineStyles"
        | "placeholders"
        | "linkBlock"
        | "childBlocks"
        | "maxTextBlocks"
        | "listLevelMax"
        | "headingLevels"
    >;
}

const TipTapContentTranslationDialog = ({
    open,
    onClose,
    originalContent,
    translatedContent,
    onApplyTranslation,
    editorProps,
}: TipTapContentTranslationDialogProps) => (
    <BaseTranslationDialog
        open={open}
        onClose={onClose}
        originalText={originalContent}
        translatedText={translatedContent}
        onApplyTranslation={onApplyTranslation}
        renderOriginalText={(content) => <TipTapEditor state={{ tipTapContent: content }} updateState={() => {}} {...editorProps} readOnly />}
        renderTranslatedText={(content, onChange) => (
            <TipTapEditor
                state={{ tipTapContent: content }}
                updateState={(next) => {
                    const nextState = typeof next === "function" ? next({ tipTapContent: content }) : next;
                    onChange(nextState.tipTapContent);
                }}
                {...editorProps}
                disableContentTranslation
            />
        )}
    />
);

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

    if (
        headingLevels &&
        (headingLevels.length === 0 ||
            new Set(headingLevels).size !== headingLevels.length ||
            headingLevels.some((level) => !Number.isInteger(level) || level < 1 || level > 6))
    ) {
        throw new Error("headingLevels must be a non-empty array of unique integers between 1 and 6");
    }
    const disableContentTranslation = options?.disableContentTranslation;

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
        disableContentTranslation,
    };

    const tipTapExtensions = buildTipTapExtensions(sharedEditorProps);

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
            let content = await translateTipTapContentAsync(state.tipTapContent, translate, tipTapExtensions);
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
