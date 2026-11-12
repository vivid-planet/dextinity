import { createTipTapRichTextBlock } from "@dextinity/cms-api";
import { mailRichTextBlockOptions } from "@src/mail/blocks/mail-rich-text.block.js";

export const EmailCampaignRichTextBlock = createTipTapRichTextBlock(
    {
        ...mailRichTextBlockOptions,
        // Only a campaign is sent through Brevo, which is what substitutes the salutation.
        placeholders: [{ name: "SALUTATION" }],
    },
    "EmailCampaignRichText",
);
