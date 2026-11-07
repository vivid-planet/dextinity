import { createRichTextBlock } from "@dextinity/cms-api";
import { MailLinkBlock } from "@src/mail/blocks/mail-link.block.js";

export const MailRichTextBlock = createRichTextBlock({ link: MailLinkBlock });
