import { Node as ProseMirrorNode, type Schema } from "@tiptap/pm/model";

import type { TipTapResolvedTextBlock } from "./textBlocks";

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

/**
 * Whether the content names a text block that isn't configured. The name is all a node carries, so
 * an unknown one would leave the API without a tag to render it as. A node that names none takes
 * the schema's default text block.
 */
export function containsInvalidTextBlock(content: TipTapContent, textBlocks: TipTapResolvedTextBlock[]): boolean {
    if (typeof content !== "object" || content === null) {
        return false;
    }

    const name = content.attrs?.textBlock;
    if (content.type === "textBlock" && name != null && !textBlocks.some((textBlock) => textBlock.name === name)) {
        return true;
    }

    if (!Array.isArray(content.content)) {
        return false;
    }

    return content.content.some((child: TipTapContent) => containsInvalidTextBlock(child, textBlocks));
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
    { maxTextBlocks, listLevelMax, textBlocks }: { maxTextBlocks?: number; listLevelMax?: number; textBlocks: TipTapResolvedTextBlock[] },
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

        if (containsInvalidTextBlock(value as TipTapContent, textBlocks)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}
