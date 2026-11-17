import type { Config } from "@dextinity/mail-react";
import type { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { EmailCampaignContentBlock } from "@src/brevo/blocks/EmailCampaignContentBlock";
import { MailRoot } from "@src/mail/components/MailRoot";
import { type IntlConfig, IntlProvider } from "react-intl";

interface EmailCampaignMailProps {
    content: EmailCampaignContentBlockData;
    config: Config;
    locale: string;
    messages: IntlConfig["messages"];
}

export const EmailCampaignMail = ({ content, config, locale, messages }: EmailCampaignMailProps) => {
    return (
        <IntlProvider messages={messages} locale={locale}>
            <MailRoot config={config}>
                <EmailCampaignContentBlock content={content} />
            </MailRoot>
        </IntlProvider>
    );
};
