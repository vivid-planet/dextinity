import { createTipTapRichTextBlock, type CreateTipTapRichTextBlockOptions } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block";

const mailTipTapRichTextBlockOptions: CreateTipTapRichTextBlockOptions = {
    link: MailLinkBlock,
    supports: ["bold", "italic", "sub", "sup", "strike", "unordered-list", "ordered-list", "non-breaking-space", "soft-hyphen"],
    // The mail theme has one text variant per style, so styles take the place of the editor's heading levels.
    textBlockStyles: [
        { name: "title", appliesTo: ["paragraph"] },
        { name: "header", appliesTo: ["paragraph"] },
    ],
};

export const MailTipTapRichTextBlock = createTipTapRichTextBlock(mailTipTapRichTextBlockOptions, "MailTipTapRichText");
