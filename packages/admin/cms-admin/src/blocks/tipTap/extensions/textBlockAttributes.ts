/**
 * The attribute that identifies a node's text block. It is rendered to (and parsed from) HTML, so it
 * survives the content translation's HTML round trip.
 */
export const textBlockAttribute = (defaultTextBlock: string) => ({
    textBlock: {
        default: defaultTextBlock,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-text-block"),
        renderHTML: (attributes: { textBlock: string }) => ({ "data-text-block": attributes.textBlock }),
    },
});
