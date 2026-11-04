import { mergeAttributes, Node } from "@tiptap/core";

export const NonBreakingSpace = Node.create({
    name: "nonBreakingSpace",
    group: "inline",
    inline: true,
    selectable: false,
    atom: true,

    parseHTML() {
        return [{ tag: "span[data-type='non-breaking-space']" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes, { "data-type": "non-breaking-space" }), "\u00a0"];
    },
});
