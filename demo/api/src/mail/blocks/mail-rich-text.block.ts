import { createTipTapRichTextBlock, type CreateTipTapRichTextBlockOptions } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block.js";

const smallStyle = { name: "small" };

export const mailRichTextBlockOptions: CreateTipTapRichTextBlockOptions = {
    link: MailLinkBlock,
    textBlocks: [{ name: "paragraph", tag: "p", styles: [{ name: "title" }, { name: "header" }, smallStyle] }],
    orderedList: { styles: [smallStyle] },
    unorderedList: { styles: [smallStyle] },
};

export const MailRichTextBlock = createTipTapRichTextBlock(mailRichTextBlockOptions, "MailRichText");
