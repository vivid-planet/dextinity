import type { JSONContent } from "@tiptap/core";

import type { Block } from "../../block";
import type { TipTapResolvedOptions, TipTapTextBlock, TipTapTextBlockTag } from "../createTipTapRichTextBlock";

interface DraftJsInlineStyleRange {
    style: string;
    offset: number;
    length: number;
}

interface DraftJsEntityRange {
    key: number;
    offset: number;
    length: number;
}

interface DraftJsBlock {
    key?: string;
    type: string;
    text: string;
    depth?: number;
    inlineStyleRanges?: DraftJsInlineStyleRange[];
    entityRanges?: DraftJsEntityRange[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any>;
}

interface DraftJsEntity {
    type: string;
    mutability?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
}

interface DraftJsContent {
    blocks: DraftJsBlock[];
    entityMap: Record<string, DraftJsEntity>;
}

interface TextBlockMapping {
    /**
     * Name of the `textBlocks` entry the DraftJS block converts to. Defaults to the entry inferred
     * from the DraftJS block type: `header-one`…`header-six` keep their heading level, all other
     * block types become the configured paragraph. If more than one `textBlocks` entry shares that
     * tag, the first one (in `textBlocks` order) is used.
     */
    textBlockName?: string;
    /**
     * TipTap `textBlockStyle` attribute value applied to the converted text block. Falls back to the
     * resolved `textBlocks` entry's `defaultStyle` when not given.
     */
    textBlockStyle?: string;
}

interface ConvertOptions {
    resolvedOptions: TipTapResolvedOptions;
    link?: Block;
    /**
     * Maps DraftJS block types (e.g. a custom `paragraph-small`) to a TipTap text block. Matched
     * blocks become the mapped `textBlocks` entry with the given `textBlockStyle` applied.
     *
     * Pass a plain string as a shorthand for `{ textBlockStyle: <string> }`.
     */
    textBlockMap?: Record<string, string | TextBlockMapping>;
    /**
     * Maps DraftJS custom inline style names (e.g. `highlight` from a DraftJS `customInlineStyles`
     * configuration) to TipTap `inlineStyle` mark type values.
     * Matched ranges become `{ type: "inlineStyle", attrs: { type: <mappedValue> } }`.
     */
    inlineStyleMap?: Record<string, string>;
    /**
     * Limits the nesting depth of the generated lists. Draft.js list items that are indented deeper
     * are placed on the deepest allowed level instead.
     */
    listLevelMax?: number;
}

type TipTapMarkOption = "bold" | "italic" | "underline" | "strike" | "sup" | "sub";

const INLINE_STYLE_TO_MARK: Record<string, { mark: string; option: TipTapMarkOption }> = {
    BOLD: { mark: "bold", option: "bold" },
    ITALIC: { mark: "italic", option: "italic" },
    UNDERLINE: { mark: "underline", option: "underline" },
    STRIKETHROUGH: { mark: "strike", option: "strike" },
    SUP: { mark: "superscript", option: "sup" },
    SUB: { mark: "subscript", option: "sub" },
};

const HEADER_TYPE_TO_TAG: Record<string, TipTapTextBlockTag> = {
    "header-one": "heading-1",
    "header-two": "heading-2",
    "header-three": "heading-3",
    "header-four": "heading-4",
    "header-five": "heading-5",
    "header-six": "heading-6",
};

/**
 * Resolves which `textBlocks` entry a converted node uses: an explicit name wins, then the entry
 * matching `tag` (the first one, if more than one shares it), then the schema's overall
 * `defaultTextBlock` as a last resort, e.g. when `tag` isn't configured in this schema.
 */
function resolveTextBlock(
    tag: TipTapTextBlockTag | undefined,
    explicitName: string | undefined,
    textBlocks: TipTapTextBlock[],
    defaultTextBlock: TipTapTextBlock,
): TipTapTextBlock {
    const named = explicitName ? textBlocks.find((b) => b.name === explicitName) : undefined;
    if (named) {
        return named;
    }
    const byTag = tag ? textBlocks.find((b) => b.tag === tag) : undefined;
    if (byTag) {
        return byTag;
    }
    return defaultTextBlock;
}

/**
 * Builds a document with a single empty text block, matching the target schema's `defaultTextBlock`.
 */
export function buildEmptyTipTapDoc(resolvedOptions: TipTapResolvedOptions): JSONContent {
    return {
        type: "doc",
        content: [makeTextBlockNode([], { textBlocks: resolvedOptions.textBlocks, defaultTextBlock: resolvedOptions.defaultTextBlock })],
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

interface InlineSegment {
    text: string;
    marks: NonNullable<JSONContent["marks"]>;
}

function buildInlineContent({
    block,
    entityMap,
    resolvedOptions,
    hasLink,
    inlineStyleMap,
}: {
    block: DraftJsBlock;
    entityMap: Record<string, DraftJsEntity>;
    resolvedOptions: TipTapResolvedOptions;
    hasLink: boolean;
    inlineStyleMap: Record<string, string>;
}): JSONContent[] {
    const text = block.text ?? "";
    if (text.length === 0) {
        return [];
    }

    const splitPoints = new Set<number>([0, text.length]);

    const styleRanges = (block.inlineStyleRanges ?? []).map((range) => ({
        style: range.style,
        start: clamp(range.offset, 0, text.length),
        end: clamp(range.offset + range.length, 0, text.length),
    }));
    for (const range of styleRanges) {
        splitPoints.add(range.start);
        splitPoints.add(range.end);
    }

    const entityRanges = (block.entityRanges ?? []).map((range) => ({
        key: String(range.key),
        start: clamp(range.offset, 0, text.length),
        end: clamp(range.offset + range.length, 0, text.length),
    }));
    for (const range of entityRanges) {
        splitPoints.add(range.start);
        splitPoints.add(range.end);
    }

    const sortedPoints = Array.from(splitPoints).sort((a, b) => a - b);
    const segments: InlineSegment[] = [];

    for (let i = 0; i < sortedPoints.length - 1; i++) {
        const start = sortedPoints[i];
        const end = sortedPoints[i + 1];
        if (end <= start) {
            continue;
        }

        const segmentText = text.slice(start, end);
        if (segmentText.length === 0) {
            continue;
        }

        const marks: NonNullable<JSONContent["marks"]> = [];

        for (const range of styleRanges) {
            if (range.start <= start && range.end >= end) {
                const mapping = INLINE_STYLE_TO_MARK[range.style];
                if (mapping && resolvedOptions[mapping.option]) {
                    if (!marks.some((mark) => mark.type === mapping.mark)) {
                        marks.push({ type: mapping.mark });
                    }
                } else {
                    const inlineStyleType = inlineStyleMap[range.style];
                    if (inlineStyleType !== undefined) {
                        if (!marks.some((mark) => mark.type === "inlineStyle" && mark.attrs?.type === inlineStyleType)) {
                            marks.push({ type: "inlineStyle", attrs: { type: inlineStyleType } });
                        }
                    }
                }
            }
        }

        if (hasLink) {
            for (const range of entityRanges) {
                if (range.start <= start && range.end >= end) {
                    const entity = entityMap[range.key];
                    if (entity && entity.type === "LINK") {
                        marks.push({ type: "link", attrs: { data: entity.data } });
                    }
                }
            }
        }

        segments.push({ text: segmentText, marks });
    }

    return segments.flatMap((segment) => splitAtomChars(segment.text, segment.marks, resolvedOptions));
}

const NBSP_CHAR = " ";
const SOFT_HYPHEN_CHAR = "­";

function makeTextNode(text: string, marks: NonNullable<JSONContent["marks"]>): JSONContent {
    const node: JSONContent = { type: "text", text };
    if (marks.length > 0) {
        node.marks = marks;
    }
    return node;
}

// Splits a text segment so each U+00A0/U+00AD character (the way the DraftJS
// RTE persists non-breaking-spaces and soft-hyphens) becomes a dedicated TipTap atom node
// when the corresponding feature is supported. Otherwise the characters are preserved as-is
// inside the surrounding text node.
function splitAtomChars(text: string, marks: NonNullable<JSONContent["marks"]>, resolvedOptions: TipTapResolvedOptions): JSONContent[] {
    const { nonBreakingSpace, softHyphen } = resolvedOptions;

    if ((!nonBreakingSpace && !softHyphen) || (!text.includes(NBSP_CHAR) && !text.includes(SOFT_HYPHEN_CHAR))) {
        return text.length === 0 ? [] : [makeTextNode(text, marks)];
    }

    const nodes: JSONContent[] = [];
    let buffer = "";
    const flushBuffer = () => {
        if (buffer.length > 0) {
            nodes.push(makeTextNode(buffer, marks));
            buffer = "";
        }
    };

    for (const char of text) {
        if (char === NBSP_CHAR && nonBreakingSpace) {
            flushBuffer();
            nodes.push({ type: "nonBreakingSpace" });
        } else if (char === SOFT_HYPHEN_CHAR && softHyphen) {
            flushBuffer();
            nodes.push({ type: "softHyphen" });
        } else {
            buffer += char;
        }
    }
    flushBuffer();
    return nodes;
}

function makeTextBlockNode(
    inlineContent: JSONContent[],
    {
        tag,
        textBlockName,
        textBlockStyle: explicitTextBlockStyle,
        textBlocks,
        defaultTextBlock,
        skipDefaultStyle,
    }: {
        tag?: TipTapTextBlockTag;
        textBlockName?: string;
        textBlockStyle?: string;
        textBlocks: TipTapTextBlock[];
        defaultTextBlock: TipTapTextBlock;
        // A list item's paragraph draws its style from `listStyles`, not the resolved `textBlocks`
        // entry's own `defaultStyle` — a list isn't a `textBlocks` entry of its own.
        skipDefaultStyle?: boolean;
    },
): JSONContent {
    const resolved = resolveTextBlock(tag, textBlockName, textBlocks, defaultTextBlock);
    const node: JSONContent = { type: resolved.tag === "paragraph" ? "paragraph" : "heading" };

    const attrs: JSONContent["attrs"] = { textBlockName: resolved.name };
    if (resolved.tag !== "paragraph") {
        attrs.level = Number(resolved.tag.slice("heading-".length));
    }
    const textBlockStyle = explicitTextBlockStyle ?? (skipDefaultStyle ? undefined : resolved.defaultStyle);
    if (textBlockStyle !== undefined) {
        attrs.textBlockStyle = textBlockStyle;
    }
    node.attrs = attrs;

    if (inlineContent.length > 0) {
        node.content = inlineContent;
    }
    return node;
}

// A list item's content always starts with a plain paragraph text block, regardless of which
// `textBlocks` entry happens to be listed first in the schema.
function makeListItem(inlineContent: JSONContent[], textBlocks: TipTapTextBlock[], defaultTextBlock: TipTapTextBlock): JSONContent {
    return {
        type: "listItem",
        content: [makeTextBlockNode(inlineContent, { tag: "paragraph", textBlocks, defaultTextBlock, skipDefaultStyle: true })],
    };
}

type ListType = "orderedList" | "bulletList";

const LIST_BLOCK_TYPE_TO_LIST: Record<string, { listType: ListType; option: "orderedList" | "unorderedList" }> = {
    "unordered-list-item": { listType: "bulletList", option: "unorderedList" },
    "ordered-list-item": { listType: "orderedList", option: "orderedList" },
};

interface OpenList {
    type: ListType;
    items: JSONContent[];
}

function normalizeTextBlockMapping(mapping: string | TextBlockMapping | undefined): TextBlockMapping | undefined {
    if (mapping === undefined) {
        return undefined;
    }
    return typeof mapping === "string" ? { textBlockStyle: mapping } : mapping;
}

export function convertDraftJsToTipTap(draftContent: DraftJsContent | undefined | null, options: ConvertOptions): JSONContent {
    const resolvedOptions = options.resolvedOptions;
    const textBlocks = resolvedOptions.textBlocks;
    const defaultTextBlock = resolvedOptions.defaultTextBlock;

    if (!draftContent || !Array.isArray(draftContent.blocks) || draftContent.blocks.length === 0) {
        return buildEmptyTipTapDoc(resolvedOptions);
    }

    const hasLink = !!options.link;
    const textBlockMap = options.textBlockMap ?? {};
    const inlineStyleMap = options.inlineStyleMap ?? {};
    const entityMap = draftContent.entityMap ?? {};
    const maxListLevels = options.listLevelMax !== undefined ? Math.max(options.listLevelMax, 1) : undefined;

    const topLevel: JSONContent[] = [];

    // Draft.js stores list nesting as a flat sequence of list items carrying a `depth`, while TipTap
    // nests a sub-list inside the `listItem` it belongs to. The stack holds the lists that are
    // currently open, from the outermost level to the level the previous list item was placed on.
    const openLists: OpenList[] = [];

    const closeDeepestList = () => {
        const closedList = openLists.pop();
        if (!closedList || closedList.items.length === 0) {
            return;
        }

        const list: JSONContent = { type: closedList.type, content: closedList.items };
        const parentList = openLists[openLists.length - 1];
        if (parentList) {
            const parentItem = parentList.items[parentList.items.length - 1];
            parentItem.content = [...(parentItem.content ?? []), list];
        } else {
            topLevel.push(list);
        }
    };

    const flushLists = () => {
        while (openLists.length > 0) {
            closeDeepestList();
        }
    };

    const addListItem = (listType: ListType, depth: number, inlineContent: JSONContent[]) => {
        // A list item may only be indented one level deeper than its predecessor, no matter how
        // large the gap in Draft.js is. `listLevelMax` limits the nesting further.
        let level = Math.min(Math.max(depth, 0), openLists.length);
        if (maxListLevels !== undefined) {
            level = Math.min(level, maxListLevels - 1);
        }

        while (openLists.length > level + 1) {
            closeDeepestList();
        }
        if (openLists.length === level + 1 && openLists[level].type !== listType) {
            closeDeepestList();
        }
        if (openLists.length === level) {
            openLists.push({ type: listType, items: [] });
        }

        openLists[openLists.length - 1].items.push(makeListItem(inlineContent, textBlocks, defaultTextBlock));
    };

    for (const block of draftContent.blocks) {
        const inlineContent = buildInlineContent({ block, entityMap, resolvedOptions, hasLink, inlineStyleMap });

        const listMapping = LIST_BLOCK_TYPE_TO_LIST[block.type];
        if (listMapping && resolvedOptions[listMapping.option]) {
            addListItem(listMapping.listType, block.depth ?? 0, inlineContent);
            continue;
        }

        flushLists();

        const mapping = normalizeTextBlockMapping(textBlockMap[block.type]);
        const tag = HEADER_TYPE_TO_TAG[block.type];

        topLevel.push(
            makeTextBlockNode(inlineContent, {
                tag,
                textBlockName: mapping?.textBlockName,
                textBlockStyle: mapping?.textBlockStyle,
                textBlocks,
                defaultTextBlock,
            }),
        );
    }

    flushLists();

    if (topLevel.length === 0) {
        return buildEmptyTipTapDoc(resolvedOptions);
    }

    return { type: "doc", content: topLevel };
}

export function buildStrippedTipTapDoc(draftContent: DraftJsContent | undefined | null, resolvedOptions: TipTapResolvedOptions): JSONContent {
    if (!draftContent || !Array.isArray(draftContent.blocks) || draftContent.blocks.length === 0) {
        return buildEmptyTipTapDoc(resolvedOptions);
    }

    const content: JSONContent[] = draftContent.blocks.map((block) => {
        const text = block.text ?? "";
        return makeTextBlockNode(text.length === 0 ? [] : [{ type: "text", text }], {
            textBlocks: resolvedOptions.textBlocks,
            defaultTextBlock: resolvedOptions.defaultTextBlock,
        });
    });

    if (content.length === 0) {
        return buildEmptyTipTapDoc(resolvedOptions);
    }

    return { type: "doc", content };
}

export type { ConvertOptions, DraftJsContent, TextBlockMapping };
