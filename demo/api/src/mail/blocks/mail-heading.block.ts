import { createTipTapRichTextBlock } from "@dextinity/cms-api";

export const MailHeadingBlock = createTipTapRichTextBlock(
    {
        textBlocks: [
            { name: "title", tag: "h1" },
            { name: "header", tag: "h2" },
        ],
    },
    "MailHeading",
);
