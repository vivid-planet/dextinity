/**
 * The attributes that identify a node's text block and the style applied to it. They are rendered to
 * (and parsed from) HTML, so they survive the content translation's HTML round trip.
 */
export const textBlockAttribute = {
    textBlock: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-text-block"),
        renderHTML: (attributes: { textBlock: string | null }) => (attributes.textBlock ? { "data-text-block": attributes.textBlock } : {}),
    },
};

export const textBlockStyleAttribute = {
    textBlockStyle: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-text-block-style"),
        renderHTML: (attributes: { textBlockStyle: string | null }) =>
            attributes.textBlockStyle ? { "data-text-block-style": attributes.textBlockStyle } : {},
    },
};
