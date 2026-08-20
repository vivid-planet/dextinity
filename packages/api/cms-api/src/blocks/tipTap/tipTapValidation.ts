import { Node as ProseMirrorNode, type Schema } from "@tiptap/pm/model";

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

export function containsInvalidHeadingLevel(content: TipTapContent, headingLevels: number[]): boolean {
    if (typeof content !== "object" || content === null) {
        return false;
    }

    if (content.type === "heading" && !headingLevels.includes(content.attrs?.level)) {
        return true;
    }

    if (!Array.isArray(content.content)) {
        return false;
    }

    return content.content.some((child: TipTapContent) => containsInvalidHeadingLevel(child, headingLevels));
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
    { maxTextBlocks, listLevelMax, headingLevels }: { maxTextBlocks?: number; listLevelMax?: number; headingLevels?: number[] } = {},
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

        if (headingLevels !== undefined && containsInvalidHeadingLevel(value as TipTapContent, headingLevels)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}
