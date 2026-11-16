import { createTipTapRichTextBlock, type CreateTipTapRichTextBlockOptions } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block.js";

export const mailRichTextBlockOptions: CreateTipTapRichTextBlockOptions = {
    link: MailLinkBlock,
    textBlocks: [{ name: "paragraph", tag: "p", styles: [{ name: "title" }, { name: "header" }, { name: "small" }] }],
};

export const MailRichTextBlock = createTipTapRichTextBlock(mailRichTextBlockOptions, "MailRichText");
