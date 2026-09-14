import type { JSONContent } from "@tiptap/core";

import type { Block } from "../../block";
import type { TipTapSupports } from "../createTipTapRichTextBlock";

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

type TipTapTextBlockStyleTargetType = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "heading-4" | "heading-5" | "heading-6";

interface TextBlockStyleMapping {
    /**
     * TipTap text block type the DraftJS block is converted to. Use this for DraftJS block types
     * that were rendered as a heading (e.g. a custom `headline450` block type rendered as `<h2>`),
     * so the semantic tag isn't lost.
     *
     * Defaults to the type derived from the DraftJS block type: `header-one`…`header-six` keep
     * their heading level, all other block types become a paragraph.
     */
    textBlockType?: TipTapTextBlockStyleTargetType;
    /**
     * TipTap `textBlockStyle` attribute value applied to the converted text block.
     */
    textBlockStyle?: string;
}

interface ConvertOptions {
    supports?: TipTapSupports[];
    link?: Block;
    /**
     * Maps DraftJS block types (e.g. custom `paragraph-small`) to a TipTap `textBlockStyle`
     * attribute value. Matched blocks become `{ type: "paragraph", attrs: { textBlockStyle: ... } }`.
     *
     * Pass a `{ textBlockType, textBlockStyle }` object instead of a plain style name to also
     * control the text block type, for instance to convert a DraftJS block type that was rendered
     * as `<h2>` into a TipTap heading with level 2.
     */
    textBlockStyleMap?: Record<string, string | TextBlockStyleMapping>;
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

const INLINE_STYLE_TO_MARK: Record<string, { mark: string; supports: TipTapSupports }> = {
    BOLD: { mark: "bold", supports: "bold" },
    ITALIC: { mark: "italic", supports: "italic" },
    UNDERLINE: { mark: "underline", supports: "underline" },
    STRIKETHROUGH: { mark: "strike", supports: "strike" },
    SUP: { mark: "superscript", supports: "sup" },
    SUB: { mark: "subscript", supports: "sub" },
};

const HEADER_TYPE_TO_LEVEL: Record<string, number> = {
    "header-one": 1,
    "header-two": 2,
    "header-three": 3,
    "header-four": 4,
    "header-five": 5,
    "header-six": 6,
};

const TEXT_BLOCK_TYPE_TO_HEADING_LEVEL: Record<TipTapTextBlockStyleTargetType, number | undefined> = {
    paragraph: undefined,
    "heading-1": 1,
    "heading-2": 2,
    "heading-3": 3,
    "heading-4": 4,
    "heading-5": 5,
    "heading-6": 6,
};

function makeEmptyDoc(): JSONContent {
    return { type: "doc", content: [{ type: "paragraph" }] };
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

interface InlineSegment {
    text: string;
    marks: NonNullable<JSONContent["marks"]>;
}

function buildInlineContent(
    block: DraftJsBlock,
    entityMap: Record<string, DraftJsEntity>,
    supports: Set<TipTapSupports>,
    hasLink: boolean,
    inlineStyleMap: Record<string, string>,
): JSONContent[] {
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
                if (mapping && supports.has(mapping.supports)) {
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

    return segments.flatMap((segment) => splitAtomChars(segment.text, segment.marks, supports));
}

const NBSP_CHAR = "\u00a0";
const SOFT_HYPHEN_CHAR = "\u00ad";

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
function splitAtomChars(text: string, marks: NonNullable<JSONContent["marks"]>, supports: Set<TipTapSupports>): JSONContent[] {
    const supportsNbsp = supports.has("non-breaking-space");
    const supportsShy = supports.has("soft-hyphen");

    if ((!supportsNbsp && !supportsShy) || (!text.includes(NBSP_CHAR) && !text.includes(SOFT_HYPHEN_CHAR))) {
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
        if (char === NBSP_CHAR && supportsNbsp) {
            flushBuffer();
            nodes.push({ type: "nonBreakingSpace" });
        } else if (char === SOFT_HYPHEN_CHAR && supportsShy) {
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
    { headingLevel, textBlockStyle }: { headingLevel?: number; textBlockStyle?: string } = {},
): JSONContent {
    const node: JSONContent = { type: headingLevel !== undefined ? "heading" : "paragraph" };

    const attrs: JSONContent["attrs"] = {};
    if (headingLevel !== undefined) {
        attrs.level = headingLevel;
    }
    if (textBlockStyle !== undefined) {
        attrs.textBlockStyle = textBlockStyle;
    }
    if (Object.keys(attrs).length > 0) {
        node.attrs = attrs;
    }

    if (inlineContent.length > 0) {
        node.content = inlineContent;
    }
    return node;
}

function makeListItem(inlineContent: JSONContent[]): JSONContent {
    return {
        type: "listItem",
        content: [makeTextBlockNode(inlineContent)],
    };
}

type ListType = "orderedList" | "bulletList";

const LIST_BLOCK_TYPE_TO_LIST: Record<string, { listType: ListType; supports: TipTapSupports }> = {
    "unordered-list-item": { listType: "bulletList", supports: "unordered-list" },
    "ordered-list-item": { listType: "orderedList", supports: "ordered-list" },
};

interface OpenList {
    type: ListType;
    items: JSONContent[];
}

function normalizeTextBlockStyleMapping(mapping: string | TextBlockStyleMapping | undefined): TextBlockStyleMapping | undefined {
    if (mapping === undefined) {
        return undefined;
    }
    return typeof mapping === "string" ? { textBlockStyle: mapping } : mapping;
}

export function convertDraftJsToTipTap(draftContent: DraftJsContent | undefined | null, options: ConvertOptions = {}): JSONContent {
    if (!draftContent || !Array.isArray(draftContent.blocks) || draftContent.blocks.length === 0) {
        return makeEmptyDoc();
    }

    const supports = new Set<TipTapSupports>(options.supports ?? []);
    const hasLink = !!options.link;
    const textBlockStyleMap = options.textBlockStyleMap ?? {};
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

        openLists[openLists.length - 1].items.push(makeListItem(inlineContent));
    };

    for (const block of draftContent.blocks) {
        const inlineContent = buildInlineContent(block, entityMap, supports, hasLink, inlineStyleMap);

        const listMapping = LIST_BLOCK_TYPE_TO_LIST[block.type];
        if (listMapping && supports.has(listMapping.supports)) {
            addListItem(listMapping.listType, block.depth ?? 0, inlineContent);
            continue;
        }

        flushLists();

        const mapping = normalizeTextBlockStyleMapping(textBlockStyleMap[block.type]);
        const headingLevel =
            mapping?.textBlockType !== undefined ? TEXT_BLOCK_TYPE_TO_HEADING_LEVEL[mapping.textBlockType] : HEADER_TYPE_TO_LEVEL[block.type];

        topLevel.push(
            makeTextBlockNode(inlineContent, {
                headingLevel: headingLevel !== undefined && supports.has("heading") ? headingLevel : undefined,
                textBlockStyle: mapping?.textBlockStyle,
            }),
        );
    }

    flushLists();

    if (topLevel.length === 0) {
        return makeEmptyDoc();
    }

    return { type: "doc", content: topLevel };
}

export function buildStrippedTipTapDoc(draftContent: DraftJsContent | undefined | null): JSONContent {
    if (!draftContent || !Array.isArray(draftContent.blocks) || draftContent.blocks.length === 0) {
        return makeEmptyDoc();
    }

    const content: JSONContent[] = draftContent.blocks.map((block) => {
        const text = block.text ?? "";
        if (text.length === 0) {
            return { type: "paragraph" };
        }
        return { type: "paragraph", content: [{ type: "text", text }] };
    });

    if (content.length === 0) {
        return makeEmptyDoc();
    }

    return { type: "doc", content };
}

export type { ConvertOptions, DraftJsContent, TextBlockStyleMapping };
