import { Mark, mergeAttributes } from "@tiptap/core";

import { createJsonDataAttribute, parseJsonData } from "./jsonDataAttribute";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        richTextEditorLink: {
            setLinkData: (attrs: { data: any }) => ReturnType;
            unsetLinkData: () => ReturnType;
        };
    }
}

export const Link = Mark.create({
    name: "link",
    inclusive: false,
    excludes: "",

    addAttributes() {
        return {
            data: createJsonDataAttribute("data-cms-link"),
        };
    },

    parseHTML() {
        return [{ tag: "a[data-cms-link]", getAttrs: (element) => (parseJsonData(element.getAttribute("data-cms-link")) === null ? false : null) }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "a",
            mergeAttributes(HTMLAttributes, {
                style: "color: inherit; text-decoration: underline; cursor: pointer;",
            }),
            0,
        ];
    },

    addCommands() {
        return {
            setLinkData:
                (attrs) =>
                ({ commands }) =>
                    commands.setMark(this.name, attrs),
            unsetLinkData:
                () =>
                ({ commands }) =>
                    commands.unsetMark(this.name),
        };
    },
});
