import { createRichTextBlock } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block";

export const MailTwoListSizesRichTextBlock = createRichTextBlock({ link: MailLinkBlock }, "MailTwoListSizesRichText");
