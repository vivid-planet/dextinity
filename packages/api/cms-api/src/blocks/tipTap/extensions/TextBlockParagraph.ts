import Paragraph from "@tiptap/extension-paragraph";

export const TextBlockParagraph = Paragraph.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textBlockName: {
                default: null,
            },
            textBlockStyle: {
                default: null,
            },
        };
    },
});
