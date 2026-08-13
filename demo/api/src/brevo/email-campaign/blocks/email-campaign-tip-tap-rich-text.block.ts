import { createTipTapRichTextBlock } from "@dextinity/cms-api";
import { mailTipTapRichTextBlockOptions } from "@src/mail/blocks/mail-tip-tap-rich-text.block";

export const EmailCampaignTipTapRichTextBlock = createTipTapRichTextBlock(
    {
        ...mailTipTapRichTextBlockOptions,
        // Only a campaign is sent through Brevo, which is what substitutes the salutation.
        placeholders: [{ name: "SALUTATION" }],
    },
    "EmailCampaignTipTapRichText",
);
