import { mergeAttributes, Node } from "@tiptap/core";

import type { TipTapResolvedTextBlock } from "../textBlocks";

export type TipTapTextAlign = "left" | "center" | "right" | "justify";

const textAlignments: TipTapTextAlign[] = ["left", "center", "right", "justify"];

export function resolveTextAlign(textAlign: boolean | Partial<Record<TipTapTextAlign, boolean>>): TipTapTextAlign[] {
    if (typeof textAlign === "boolean") {
        return textAlign ? textAlignments : [];
    }
    return textAlignments.filter((alignment) => textAlign[alignment]);
}

const textAlignAttribute = (textAlign: TipTapTextAlign[]) => ({
    textAlign: {
        default: null,
        validate: (value: unknown) => {
            if (value !== null && !(textAlign as unknown[]).includes(value)) {
                throw new RangeError(`Unsupported textAlign ${String(value)}`);
            }
        },
    },
});

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
    textAlign: TipTapTextAlign[];
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
                ...(textAlign.length > 0 ? textAlignAttribute(textAlign) : {}),
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
