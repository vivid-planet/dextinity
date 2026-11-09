import { Mark, mergeAttributes } from "@tiptap/core";

import { createJsonDataAttribute, parseJsonData } from "./jsonDataAttribute";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        cmsLink: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setCmsLink: (attrs: { data: any }) => ReturnType;
            unsetCmsLink: () => ReturnType;
        };
    }
}

export const CmsLink = Mark.create({
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
            setCmsLink:
                (attrs) =>
                ({ commands }) =>
                    commands.setMark(this.name, attrs),
            unsetCmsLink:
                () =>
                ({ commands }) =>
                    commands.unsetMark(this.name),
        };
    },
});
