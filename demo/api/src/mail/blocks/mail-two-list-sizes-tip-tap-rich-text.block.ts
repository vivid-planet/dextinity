import { createTipTapRichTextBlock } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block";

export const MailTwoListSizesTipTapRichTextBlock = createTipTapRichTextBlock(
    {
        link: MailLinkBlock,
        textBlocks: [{ name: "paragraph", tag: "p" }],
        textBlockStyles: [{ name: "small", appliesTo: ["paragraph", "unordered-list", "ordered-list"] }],
    },
    "MailTwoListSizesTipTapRichText",
);
