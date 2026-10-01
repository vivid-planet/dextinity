import { createTipTapRichTextBlock, type CreateTipTapRichTextBlockOptions } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block";

export const mailTipTapRichTextBlockOptions: CreateTipTapRichTextBlockOptions = {
    link: MailLinkBlock,
    textBlocks: [{ name: "paragraph", tag: "p" }],
    textBlockStyles: [
        { name: "title", appliesTo: ["paragraph"] },
        { name: "header", appliesTo: ["paragraph"] },
        { name: "small", appliesTo: ["paragraph"] },
    ],
};

export const MailTipTapRichTextBlock = createTipTapRichTextBlock(mailTipTapRichTextBlockOptions, "MailTipTapRichText");
