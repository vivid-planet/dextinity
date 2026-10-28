import type { Attribute } from "@tiptap/core";

export function parseJsonData(element: HTMLElement): unknown {
    const json = element.getAttribute("data-json");
    if (json === null) {
        return null;
    }
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export const jsonDataAttribute: Attribute = {
    default: null,
    parseHTML: parseJsonData,
    renderHTML: ({ data }) => (data === null || data === undefined ? {} : { "data-json": JSON.stringify(data) }),
};
