import { createRichTextBlock } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block";

export const MailTwoListSizesRichTextBlock = createRichTextBlock(
    { link: MailLinkBlock },
    { name: "MailTwoListSizesRichText", description: "Formatted text for emails, with two list sizes to choose from." },
);
