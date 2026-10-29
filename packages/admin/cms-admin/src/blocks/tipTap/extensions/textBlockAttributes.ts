/**
 * The attributes that identify a node's text block and the style applied to it. They are rendered to
 * (and parsed from) HTML, so they survive the content translation's HTML round trip.
 */
export const textBlockAttribute = (defaultTextBlock: string) => ({
    textBlock: {
        default: defaultTextBlock,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-text-block"),
        renderHTML: (attributes: { textBlock: string }) => ({ "data-text-block": attributes.textBlock }),
    },
});

export type TipTapTextAlign = "left" | "center" | "right" | "justify";

const textAlignments: TipTapTextAlign[] = ["left", "center", "right", "justify"];

export function resolveTextAlign(textAlign: boolean | Partial<Record<TipTapTextAlign, boolean>>): TipTapTextAlign[] {
    if (typeof textAlign === "boolean") {
        return textAlign ? textAlignments : [];
    }
    return textAlignments.filter((alignment) => textAlign[alignment]);
}

export const textAlignAttribute = (textAlign: TipTapTextAlign[]) => ({
    textAlign: {
        default: null,
        // Pasted HTML may carry alignments the API rejects, e.g. `start` or one that isn't enabled.
        parseHTML: (element: HTMLElement) => textAlign.find((alignment) => alignment === element.style.textAlign) ?? null,
        renderHTML: (attributes: { textAlign: TipTapTextAlign | null }) =>
            attributes.textAlign ? { style: `text-align: ${attributes.textAlign}` } : {},
    },
});

export const textBlockStyleAttribute = {
    textBlockStyle: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-text-block-style"),
        renderHTML: (attributes: { textBlockStyle: string | null }) =>
            attributes.textBlockStyle ? { "data-text-block-style": attributes.textBlockStyle } : {},
    },
};
