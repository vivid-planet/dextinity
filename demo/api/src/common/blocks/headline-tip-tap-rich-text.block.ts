import { createTipTapRichTextBlock } from "@dextinity/cms-api";

export const HeadlineTipTapRichTextBlock = createTipTapRichTextBlock(
    {
        strike: false,
        textBlocks: [
            { name: "headline600", tag: "h1" },
            { name: "headline550", tag: "h2" },
            { name: "headline500", tag: "h3" },
            { name: "headline450", tag: "h4" },
            { name: "headline400", tag: "h5" },
            { name: "headline350", tag: "h6" },
        ],
        orderedList: false,
        unorderedList: false,
        maxTextBlocks: 1,
        migrateFromDraftJs: true,
    },
    "HeadlineTipTapRichText",
);
