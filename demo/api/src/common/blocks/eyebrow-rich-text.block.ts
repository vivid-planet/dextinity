import { createTipTapRichTextBlock } from "@dextinity/cms-api";

export const EyebrowRichTextBlock = createTipTapRichTextBlock(
    {
        strike: false,
        textBlocks: [{ name: "paragraph", tag: "p" }],
        orderedList: false,
        unorderedList: false,
        textAlign: { left: true, center: true },
        maxTextBlocks: 1,
    },
    "EyebrowRichText",
);
