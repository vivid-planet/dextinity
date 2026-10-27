import { createTipTapRichTextBlock } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block";

export const MailTwoListSizesTipTapRichTextBlock = createTipTapRichTextBlock(
    {
        link: MailLinkBlock,
        textBlocks: [{ name: "paragraph", tag: "p", styles: [{ name: "small" }] }],
        orderedList: { styles: [{ name: "small" }] },
        unorderedList: { styles: [{ name: "small" }] },
    },
    "MailTwoListSizesTipTapRichText",
);
