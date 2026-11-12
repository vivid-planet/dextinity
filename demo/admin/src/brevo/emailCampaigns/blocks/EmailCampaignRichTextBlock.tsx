import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { mailRichTextBlockOptions } from "@src/mail/blocks/MailRichTextBlock";
import { FormattedMessage } from "react-intl";

export const EmailCampaignRichTextBlock = {
    ...createTipTapRichTextBlock({
        ...mailRichTextBlockOptions,
        // Only a campaign is sent through Brevo, which is what substitutes the salutation.
        placeholders: [
            {
                name: "SALUTATION",
                label: <FormattedMessage id="emailCampaign.richText.placeholder.salutation" defaultMessage="Salutation" />,
            },
        ],
    }),
    name: "EmailCampaignRichText",
    displayName: <FormattedMessage id="emailCampaign.richText.displayName" defaultMessage="Rich Text" />,
};
