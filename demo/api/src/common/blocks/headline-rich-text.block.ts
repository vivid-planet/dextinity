import { createTipTapRichTextBlock, type TipTapTextBlock } from "@dextinity/cms-api";

const headlineTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const sizes = ["headline600", "headline550", "headline500", "headline450", "headline400", "headline350"];

const draftJsHeaderTypes = ["header-one", "header-two", "header-three", "header-four", "header-five", "header-six"];

// The text block sets the headline's HTML tag, the style its size, so both can be chosen independently.
const textBlocks: TipTapTextBlock[] = headlineTags.map((tag) => ({
    name: `heading-${tag.slice(1)}`,
    tag,
    styles: sizes.map((name) => ({ name })),
    defaultStyle: "headline600",
}));

export const HeadlineRichTextBlock = createTipTapRichTextBlock(
    {
        strike: false,
        textBlocks,
        defaultTextBlock: "heading-2",
        orderedList: false,
        unorderedList: false,
        textAlign: { left: true, center: true },
        maxTextBlocks: 1,
        migrateFromDraftJs: {
            // A Draft.js headline's block type was its size, while the tag was stored next to it.
            textBlockMap: Object.fromEntries(
                draftJsHeaderTypes.map((headerType, index) => [headerType, { textBlock: "heading-2", textBlockStyle: sizes[index] }]),
            ),
        },
    },
    "HeadlineRichText",
);
