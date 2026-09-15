import Paragraph from "@tiptap/extension-paragraph";

/**
 * Adds the `textBlock` (which of the configured text blocks the node is) and `textBlockStyle`
 * attributes to the paragraph node. The attributes must match the Admin's paragraph extension,
 * otherwise the API rejects content the editor produces.
 */
export const TextBlockParagraph = Paragraph.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textBlock: { default: null },
            textBlockStyle: { default: null },
        };
    },
});
