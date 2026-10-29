import type { Attribute } from "@tiptap/core";

export function parseJsonData(json: string | null): unknown {
    if (json === null) {
        return null;
    }
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function createJsonDataAttribute(htmlAttributeName: string): Attribute {
    return {
        default: null,
        parseHTML: (element) => parseJsonData(element.getAttribute(htmlAttributeName)),
        renderHTML: ({ data }) => ({ [htmlAttributeName]: data === null || data === undefined ? "" : JSON.stringify(data) }),
    };
}
