import { mergeAttributes, Node } from "@tiptap/core";

import type { TipTapResolvedTextBlock } from "../textBlocks";

const textAlignments: unknown[] = ["left", "center", "right", "justify"];

const textAlignAttribute = {
    textAlign: {
        default: null,
        validate: (value: unknown) => {
            if (value !== null && !textAlignments.includes(value)) {
                throw new RangeError(`Unsupported textAlign ${String(value)}`);
            }
        },
    },
};

/**
 * The single node every paragraph and heading is stored as, mirroring the Admin's. Which of the
 * configured text blocks it is decides the tag it renders as, so the content carries the text
 * block's name instead of a tag and a heading level.
 */
export function createTextBlock({
    textBlocks,
    defaultTextBlock,
    hasTextBlockStyles,
    textAlign,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
    hasTextBlockStyles: boolean;
    textAlign: boolean;
}) {
    return Node.create({
        name: "textBlock",
        priority: 1000,
        group: "block",
        content: "inline*",
        defining: true,

        addAttributes() {
            return {
                textBlock: { default: defaultTextBlock.name },
                ...(hasTextBlockStyles ? { textBlockStyle: { default: null } } : {}),
                ...(textAlign ? textAlignAttribute : {}),
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
