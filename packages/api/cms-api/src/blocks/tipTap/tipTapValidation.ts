import { Node as ProseMirrorNode, type Schema } from "@tiptap/pm/model";

import type { TipTapTextBlock, TipTapTextBlockTag } from "./createTipTapRichTextBlock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TipTapContent = Record<string, any>;

// ProseMirror's Node.fromJSON silently drops unknown marks. This function
// checks the raw JSON for mark types that don't exist in the schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function containsUnknownMarks(json: any, schema: Schema): boolean {
    if (typeof json !== "object" || json === null) {
        return false;
    }

    if (Array.isArray(json.marks)) {
        for (const mark of json.marks) {
            if (typeof mark?.type === "string" && !schema.marks[mark.type]) {
                return true;
            }
        }
    }
    if (Array.isArray(json.content)) {
        for (const child of json.content) {
            if (containsUnknownMarks(child, schema)) {
                return true;
            }
        }
    }
    return false;
}

function getTagFromNode(content: TipTapContent): TipTapTextBlockTag | undefined {
    if (content.type === "paragraph") {
        return "paragraph";
    }
    if (content.type === "heading" && content.attrs?.level) {
        return `heading-${content.attrs.level}` as TipTapTextBlockTag;
    }
    return undefined;
}

/**
 * Checks that every paragraph/heading node names a `textBlocks` entry (by `textBlockName`) whose
 * `tag` matches the node's actual type/level, and that its `textBlockStyle` (if set) is one of that
 * entry's `styles` — or, for a list item's paragraph, one of `listStyles` instead, since a list item
 * isn't a `textBlocks` entry of its own (lists aren't selectable via the text block type dropdown).
 * A `textBlocks` entry with a `defaultStyle` requires a style: content missing one is rejected too.
 */
export function containsInvalidTextBlock(
    content: TipTapContent,
    textBlocks: TipTapTextBlock[],
    listStyles: string[] = [],
    insideListItem = false,
): boolean {
    if (typeof content !== "object" || content === null) {
        return false;
    }

    const tag = getTagFromNode(content);
    if (tag) {
        const textBlockName = content.attrs?.textBlockName;
        const block = typeof textBlockName === "string" ? textBlocks.find((b) => b.name === textBlockName) : undefined;
        if (!block || block.tag !== tag) {
            return true;
        }
        const textBlockStyle = content.attrs?.textBlockStyle;
        const allowedStyles = insideListItem && tag === "paragraph" ? listStyles : (block.styles ?? []);
        if (textBlockStyle != null) {
            if (!allowedStyles.includes(textBlockStyle)) {
                return true;
            }
        } else if (!insideListItem && block.defaultStyle !== undefined) {
            return true;
        }
    }

    if (!Array.isArray(content.content)) {
        return false;
    }

    const isListItem = content.type === "listItem";
    return content.content.some((child: TipTapContent) => containsInvalidTextBlock(child, textBlocks, listStyles, insideListItem || isListItem));
}

export function getListNestingDepth(content: TipTapContent, currentDepth = 0): number {
    if (typeof content !== "object" || content === null) {
        return 0;
    }

    const isListNode = content.type === "bulletList" || content.type === "orderedList";
    const depth = isListNode ? currentDepth + 1 : currentDepth;

    if (!Array.isArray(content.content)) {
        return depth;
    }

    let maxDepth = depth;
    for (const child of content.content) {
        const childDepth = getListNestingDepth(child, depth);
        if (childDepth > maxDepth) {
            maxDepth = childDepth;
        }
    }
    return maxDepth;
}

export function isValidTipTapContentSync(
    value: unknown,
    schema: Schema,
    {
        maxTextBlocks,
        listLevelMax,
        textBlocks,
        listStyles,
    }: { maxTextBlocks?: number; listLevelMax?: number; textBlocks: TipTapTextBlock[]; listStyles?: string[] },
): boolean {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    try {
        if (containsUnknownMarks(value, schema)) {
            return false;
        }
        const node = ProseMirrorNode.fromJSON(schema, value);
        node.check();

        if (maxTextBlocks !== undefined) {
            const content = (value as TipTapContent).content;
            if (Array.isArray(content) && content.length > maxTextBlocks) {
                return false;
            }
        }

        if (listLevelMax !== undefined && getListNestingDepth(value as TipTapContent) > listLevelMax) {
            return false;
        }

        if (containsInvalidTextBlock(value as TipTapContent, textBlocks, listStyles)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}
