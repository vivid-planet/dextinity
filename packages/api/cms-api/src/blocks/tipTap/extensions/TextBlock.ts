import { mergeAttributes, Node } from "@tiptap/core";

import type { TipTapResolvedTextBlock } from "../textBlocks";

/**
 * The single node every paragraph and heading is stored as, mirroring the Admin's. Which of the
 * configured text blocks it is decides the tag it renders as, so the content carries the text
 * block's name instead of a tag and a heading level.
 */
export function createTextBlock({
    textBlocks,
    defaultTextBlock,
    hasTextBlockStyles,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
    hasTextBlockStyles: boolean;
}) {
    return Node.create({
        name: "textBlock",
        group: "block",
        content: "inline*",
        defining: true,

        addAttributes() {
            return {
                textBlock: { default: defaultTextBlock.name },
                ...(hasTextBlockStyles ? { textBlockStyle: { default: null } } : {}),
            };
        },

        parseHTML() {
            return [...new Set(textBlocks.map((textBlock) => textBlock.tag))].map((tag) => ({ tag }));
        },

        renderHTML({ node, HTMLAttributes }) {
            const textBlock = textBlocks.find((candidate) => candidate.name === node.attrs.textBlock) ?? defaultTextBlock;
            return [textBlock.tag, mergeAttributes(HTMLAttributes), 0];
        },
    });
}
