import type { JSONContent } from "@tiptap/core";

import type { TipTapResolvedList, TipTapResolvedTextBlock } from "./textBlocks";

/**
 * Gives every text block without a style the `defaultStyle` of its text block - or, inside a list
 * item, of the innermost list, which wins over the text block there like it does in the Admin.
 *
 * Content stored before a `defaultStyle` was configured carries no style, and the site would have to
 * render a missing style like the default. Filling it in on read means the site only ever sees the
 * style's name, without a migration the project could forget.
 */
export function applyDefaultTextBlockStyles(
    content: JSONContent,
    {
        textBlocks,
        defaultTextBlock,
        orderedList,
        unorderedList,
    }: {
        textBlocks: TipTapResolvedTextBlock[];
        defaultTextBlock: TipTapResolvedTextBlock;
        orderedList: false | TipTapResolvedList;
        unorderedList: false | TipTapResolvedList;
    },
): JSONContent {
    function apply(node: JSONContent, list: false | TipTapResolvedList): JSONContent {
        const containingList = node.type === "orderedList" ? orderedList : node.type === "bulletList" ? unorderedList : list;

        let result = node;
        if (node.type === "textBlock" && node.attrs?.textBlockStyle == null) {
            // A node naming none is the default text block, which the schema fills in.
            const name = node.attrs?.textBlock;
            const textBlock = name == null ? defaultTextBlock : textBlocks.find((candidate) => candidate.name === name);
            const defaultStyle = (containingList || textBlock)?.defaultStyle ?? null;
            if (defaultStyle !== null) {
                result = { ...node, attrs: { ...node.attrs, textBlockStyle: defaultStyle } };
            }
        }

        if (Array.isArray(result.content)) {
            result = { ...result, content: result.content.map((child) => apply(child, containingList)) };
        }
        return result;
    }

    const hasDefaultStyle = [...textBlocks, orderedList, unorderedList].some((styledNode) => styledNode && styledNode.defaultStyle !== null);
    return hasDefaultStyle ? apply(content, false) : content;
}
