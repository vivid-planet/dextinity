import Heading from "@tiptap/extension-heading";

export const TextBlockHeading = Heading.extend({
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
