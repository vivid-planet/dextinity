import { mergeAttributes, Node } from "@tiptap/core";

/**
 * A list item, holding text blocks instead of TipTap's paragraphs. Replaces StarterKit's own list
 * item, whose content expression names the paragraph node this block doesn't have.
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

    addKeyboardShortcuts() {
        return {
            Enter: () => this.editor.commands.splitListItem(this.name),
            Tab: () => this.editor.commands.sinkListItem(this.name),
            "Shift-Tab": () => this.editor.commands.liftListItem(this.name),
        };
    },
});
