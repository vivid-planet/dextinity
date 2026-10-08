import type { Node } from "@tiptap/core";
import Paragraph, { type ParagraphOptions } from "@tiptap/extension-paragraph";

export const TextBlockStyleParagraph: Node<ParagraphOptions> = Paragraph.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textBlockStyle: {
                default: null,
            },
        };
    },
});
