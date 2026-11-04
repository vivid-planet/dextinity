import { Mark } from "@tiptap/core";

export const InlineStyleMark = Mark.create({
    name: "inlineStyle",

    addAttributes() {
        return {
            type: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [{ tag: "span[data-inline-style]" }];
    },

    renderHTML({ HTMLAttributes }) {
        if (!HTMLAttributes.type) {
            return ["span", {}, 0];
        }
        return ["span", { "data-inline-style": HTMLAttributes.type }, 0];
    },
});
