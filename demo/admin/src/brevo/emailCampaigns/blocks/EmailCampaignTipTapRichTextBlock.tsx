import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { mailTipTapRichTextBlockOptions } from "@src/mail/blocks/MailTipTapRichTextBlock";
import { FormattedMessage } from "react-intl";

export const EmailCampaignTipTapRichTextBlock = {
    ...createTipTapRichTextBlock({
        ...mailTipTapRichTextBlockOptions,
        // Only a campaign is sent through Brevo, which is what substitutes the salutation.
        placeholders: [
            {
                name: "SALUTATION",
                label: <FormattedMessage id="emailCampaign.tipTapRichText.placeholder.salutation" defaultMessage="Salutation" />,
            },
        ],
    }),
    displayName: <FormattedMessage id="emailCampaign.tipTapRichText.displayName" defaultMessage="Rich Text (TipTap)" />,
};
