import type { Attribute } from "@tiptap/core";

export const jsonDataAttribute: Attribute = {
    default: null,
    parseHTML: (element) => {
        const json = element.getAttribute("data-json");
        return json === null ? null : JSON.parse(json);
    },
    renderHTML: ({ data }) => (data === null || data === undefined ? {} : { "data-json": JSON.stringify(data) }),
};
