import { Mark, mergeAttributes } from "@tiptap/core";

export const CmsLink = Mark.create({
    name: "link",
    inclusive: false,

    addAttributes() {
        return {
            data: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [{ tag: "a[data-cms-link]" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["a", mergeAttributes(HTMLAttributes, { "data-cms-link": "" }), 0];
    },
});
