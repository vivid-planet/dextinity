import { createTipTapRichTextBlock } from "@dextinity/cms-api";

export const InlineRichTextBlock = createTipTapRichTextBlock(
    {
        strike: false,
        textBlocks: [{ name: "paragraph", tag: "p" }],
        orderedList: false,
        unorderedList: false,
        maxTextBlocks: 1,
        migrateFromDraftJs: true,
    },
    "InlineRichText",
);
