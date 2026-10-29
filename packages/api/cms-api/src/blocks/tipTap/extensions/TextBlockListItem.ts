import { mergeAttributes, Node } from "@tiptap/core";

/**
 * A list item, holding text blocks instead of TipTap's paragraphs, mirroring the Admin's. Replaces
 * StarterKit's own list item, whose content expression names the paragraph node this block doesn't have.
 */
export const TextBlockListItem = Node.create({
    name: "listItem",
    content: "textBlock block*",
    defining: true,

    parseHTML() {
        return [{ tag: "li" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["li", mergeAttributes(HTMLAttributes), 0];
    },
});
