import { createTipTapRichTextBlock, type CreateTipTapRichTextBlockOptions } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block";

export const mailTipTapRichTextBlockOptions: CreateTipTapRichTextBlockOptions = {
    link: MailLinkBlock,
    textBlocks: [{ name: "paragraph", tag: "p", styles: [{ name: "title" }, { name: "header" }, { name: "small" }] }],
};

export const MailTipTapRichTextBlock = createTipTapRichTextBlock(mailTipTapRichTextBlockOptions, "MailTipTapRichText");
