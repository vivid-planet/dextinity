import type { Config } from "@dextinity/mail-react";
import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { MailRoot } from "@src/mail/components/MailRoot";
import { WelcomeEmailContentBlock } from "@src/welcomeEmail/blocks/WelcomeEmailContentBlock";
import { type IntlConfig, IntlProvider } from "react-intl";

interface WelcomeEmailMailProps {
    content: WelcomeEmailContentBlockData;
    config: Config;
    locale: string;
    messages: IntlConfig["messages"];
}

export const WelcomeEmailMail = ({ content, config, locale, messages }: WelcomeEmailMailProps) => {
    return (
        <IntlProvider messages={messages} locale={locale}>
            <MailRoot config={config}>
                <WelcomeEmailContentBlock content={content} />
            </MailRoot>
        </IntlProvider>
    );
};
