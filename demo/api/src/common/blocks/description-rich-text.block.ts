import { createTipTapRichTextBlock } from "@dextinity/cms-api";

export const DescriptionRichTextBlock = createTipTapRichTextBlock(
    {
        strike: false,
        orderedList: false,
        unorderedList: false,
        textBlocks: [{ name: "paragraph", tag: "p" }],
        maxTextBlocks: 1,
        migrateFromDraftJs: true,
    },
    "DescriptionRichText",
);
