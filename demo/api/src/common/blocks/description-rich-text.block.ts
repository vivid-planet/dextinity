import { createTipTapRichTextBlock } from "@dextinity/cms-api";

export const DescriptionRichTextBlock = createTipTapRichTextBlock(
    {
        strike: false,
        textBlocks: [{ name: "paragraph", tag: "p" }],
        orderedList: false,
        unorderedList: false,
        maxTextBlocks: 1,
        migrateFromDraftJs: true,
    },
    "DescriptionRichText",
);
