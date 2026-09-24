/**
 * The attributes a text block node carries. They mirror the Admin's, which renders them to (and
 * parses them from) HTML so they survive the content translation's HTML round trip.
 */
export const textBlockAttribute = (defaultTextBlock: string) => ({
    textBlock: { default: defaultTextBlock },
});

export const textStyleAttribute = {
    textStyle: { default: null },
};
