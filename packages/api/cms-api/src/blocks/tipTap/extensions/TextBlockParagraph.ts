import Paragraph from "@tiptap/extension-paragraph";

/**
 * Adds the `textBlock` attribute (which of the configured text blocks the node is) and, when text
 * block styles are configured, the `textBlockStyle` attribute. The attributes must match the Admin's
 * paragraph extension, otherwise the API rejects content the editor produces.
 */
export function createTextBlockParagraph({ hasTextBlockStyles }: { hasTextBlockStyles: boolean }) {
    return Paragraph.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                textBlock: { default: null },
                ...(hasTextBlockStyles ? { textBlockStyle: { default: null } } : {}),
            };
        },
    });
}
