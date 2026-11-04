import { mergeAttributes, Node } from "@tiptap/core";

export const SoftHyphen = Node.create({
    name: "softHyphen",
    group: "inline",
    inline: true,
    selectable: false,
    atom: true,

    parseHTML() {
        return [{ tag: "span[data-type='soft-hyphen']" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes, { "data-type": "soft-hyphen" }), "\u00ad"];
    },
});
