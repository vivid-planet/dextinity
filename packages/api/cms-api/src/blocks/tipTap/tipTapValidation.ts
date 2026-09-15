import { Node as ProseMirrorNode, type Schema } from "@tiptap/pm/model";

import {
    findTextBlock,
    type TipTapResolvedList,
    type TipTapResolvedStyledNode,
    type TipTapResolvedTextBlock,
    type TipTapTextBlockTag,
} from "./textBlocks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TipTapContent = Record<string, any>;

interface InlineStyle {
    name: string;
    appliesTo?: string[];
}

/**
 * The text blocks and lists the content is validated against.
 */
export interface TipTapTextBlockContext {
    textBlocks: TipTapResolvedTextBlock[];
    orderedList: false | TipTapResolvedList;
    unorderedList: false | TipTapResolvedList;
}

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

export function getTextBlockTagFromNode(node: TipTapContent): TipTapTextBlockTag | undefined {
    if (node.type === "paragraph") {
        return "p";
    }
    if (node.type === "heading") {
        return `h${node.attrs?.level}` as TipTapTextBlockTag;
    }
    return undefined;
}

const getListFromNode = (node: TipTapContent, context: TipTapTextBlockContext): TipTapResolvedList | undefined => {
    if (node.type === "orderedList") {
        return context.orderedList || undefined;
    }
    if (node.type === "bulletList") {
        return context.unorderedList || undefined;
    }
    return undefined;
};

/**
 * The text block or list whose styles apply to a paragraph/heading node. Inside a list, the list's
 * styles apply, because the list - not the paragraph its items are built from - is what the editor
 * styles there.
 */
function resolveStyledNode({
    node,
    list,
    context,
}: {
    node: TipTapContent;
    list?: TipTapResolvedList;
    context: TipTapTextBlockContext;
}): TipTapResolvedStyledNode | undefined {
    const tag = getTextBlockTagFromNode(node);
    if (tag === undefined) {
        return undefined;
    }
    return list ?? findTextBlock({ name: node.attrs?.textBlock, tag, textBlocks: context.textBlocks });
}

/**
 * Checks the text blocks against the configuration: a text block must exist for the node, an
 * explicitly stored text block name must be known, and a text block style must be allowed for the
 * text block (or the list) it is applied to.
 */
export function containsInvalidTextBlocks(content: TipTapContent, context: TipTapTextBlockContext, list?: TipTapResolvedList): boolean {
    if (typeof content !== "object" || content === null) {
        return false;
    }

    const tag = getTextBlockTagFromNode(content);
    if (tag !== undefined) {
        const styledNode = resolveStyledNode({ node: content, list, context });
        if (!styledNode) {
            return true;
        }

        const storedName = content.attrs?.textBlock;
        if (storedName != null && !context.textBlocks.some((textBlock) => textBlock.name === storedName)) {
            return true;
        }

        const style = content.attrs?.textBlockStyle;
        if (style != null && !styledNode.styles.includes(style)) {
            return true;
        }
    }

    if (!Array.isArray(content.content)) {
        return false;
    }

    const childList = getListFromNode(content, context) ?? list;
    return content.content.some((child: TipTapContent) => containsInvalidTextBlocks(child, context, childList));
}

/**
 * Checks that every inline style mark is used in a text block (or list) its `appliesTo` allows.
 */
export function containsInvalidInlineStyleMarks(
    content: TipTapContent,
    inlineStyles: InlineStyle[],
    context: TipTapTextBlockContext,
    { list, parentStyledNodeName }: { list?: TipTapResolvedList; parentStyledNodeName?: string } = {},
): boolean {
    if (typeof content !== "object" || content === null || !Array.isArray(content.content)) {
        return false;
    }

    const styledNodeName = resolveStyledNode({ node: content, list, context })?.name ?? parentStyledNodeName;
    const childList = getListFromNode(content, context) ?? list;

    for (const child of content.content) {
        if (child?.type === "text" && Array.isArray(child.marks)) {
            for (const mark of child.marks) {
                if (mark.type === "inlineStyle" && mark.attrs?.type) {
                    const inlineStyle = inlineStyles.find((style) => style.name === mark.attrs.type);
                    if (inlineStyle?.appliesTo && styledNodeName && !inlineStyle.appliesTo.includes(styledNodeName)) {
                        return true;
                    }
                }
            }
        }
        if (containsInvalidInlineStyleMarks(child, inlineStyles, context, { list: childList, parentStyledNodeName: styledNodeName })) {
            return true;
        }
    }

    return false;
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
    { maxTextBlocks, listLevelMax, textBlockContext }: { maxTextBlocks?: number; listLevelMax?: number; textBlockContext: TipTapTextBlockContext },
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

        if (containsInvalidTextBlocks(value as TipTapContent, textBlockContext)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}
