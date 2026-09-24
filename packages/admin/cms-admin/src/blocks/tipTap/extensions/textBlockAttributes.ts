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

export const textStyleAttribute = {
    textStyle: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-text-style"),
        renderHTML: (attributes: { textStyle?: string | null }) => (attributes.textStyle ? { "data-text-style": attributes.textStyle } : {}),
    },
};
