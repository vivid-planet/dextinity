import { Node as ProseMirrorNode, type Schema } from "@tiptap/pm/model";

import type { TipTapResolvedTextBlock } from "./textBlocks";
import { findStyle, type TipTapResolvedList } from "./textStyles";

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
 * Whether the content names a text block that isn't configured, or holds one inside a list item that
 * isn't stored as a `p`. The name is all a node carries, so an unknown one would leave the API
 * without a tag to render it as, and a node that names none takes the schema's default text block.
 *
 * A list item's content expression matches node types, and every text block is the same node, so it
 * can't keep a heading out - only this check can.
 */
export function containsInvalidTextBlock({
    content,
    textBlocks,
    defaultTextBlock,
    insideListItem = false,
}: {
    content: TipTapContent;
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
    insideListItem?: boolean;
}): boolean {
    if (typeof content !== "object" || content === null) {
        return false;
    }

    if (content.type === "textBlock") {
        const name = content.attrs?.textBlock;
        // A node naming none is the default text block, which the schema fills in - and which may be
        // a heading, since only lists need a `p` text block to exist at all.
        const textBlock = name == null ? defaultTextBlock : textBlocks.find((candidate) => candidate.name === name);
        if (!textBlock) {
            return true;
        }
        if (insideListItem && textBlock.tag !== "p") {
            return true;
        }
    }

    if (!Array.isArray(content.content)) {
        return false;
    }

    const childrenInsideListItem = content.type === "listItem" || insideListItem;
    return content.content.some((child: TipTapContent) =>
        containsInvalidTextBlock({ content: child, textBlocks, defaultTextBlock, insideListItem: childrenInsideListItem }),
    );
}

/**
 * Whether the content applies a style that isn't configured for the node it sits on.
 *
 * A list owns the style of its items, so a text block inside a list item must not carry one of its
 * own - otherwise the editor and the site would have two styles to choose between. A nested list is
 * a node of its own and therefore carries its own style.
 */
export function containsInvalidTextStyle({
    content,
    textBlocks,
    defaultTextBlock,
    orderedList,
    unorderedList,
    insideListItem = false,
}: {
    content: TipTapContent;
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
    orderedList: TipTapResolvedList;
    unorderedList: TipTapResolvedList;
    insideListItem?: boolean;
}): boolean {
    if (typeof content !== "object" || content === null) {
        return false;
    }

    const textStyle = content.attrs?.textStyle;

    if (content.type === "textBlock" && textStyle != null) {
        if (insideListItem) {
            return true;
        }
        const name = content.attrs?.textBlock;
        const textBlock = name == null ? defaultTextBlock : textBlocks.find((candidate) => candidate.name === name);
        if (!textBlock || !findStyle(textBlock.styles, textStyle)) {
            return true;
        }
    }

    if (content.type === "orderedList" && textStyle != null && !findStyle(orderedList.styles, textStyle)) {
        return true;
    }

    if (content.type === "bulletList" && textStyle != null && !findStyle(unorderedList.styles, textStyle)) {
        return true;
    }

    if (!Array.isArray(content.content)) {
        return false;
    }

    const childrenInsideListItem = content.type === "listItem" || insideListItem;
    return content.content.some((child: TipTapContent) =>
        containsInvalidTextStyle({
            content: child,
            textBlocks,
            defaultTextBlock,
            orderedList,
            unorderedList,
            insideListItem: childrenInsideListItem,
        }),
    );
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
        defaultTextBlock,
        orderedList,
        unorderedList,
    }: {
        maxTextBlocks?: number;
        listLevelMax?: number;
        textBlocks: TipTapResolvedTextBlock[];
        defaultTextBlock: TipTapResolvedTextBlock;
        orderedList: TipTapResolvedList;
        unorderedList: TipTapResolvedList;
    },
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

        if (containsInvalidTextBlock({ content: value as TipTapContent, textBlocks, defaultTextBlock })) {
            return false;
        }

        if (containsInvalidTextStyle({ content: value as TipTapContent, textBlocks, defaultTextBlock, orderedList, unorderedList })) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}
