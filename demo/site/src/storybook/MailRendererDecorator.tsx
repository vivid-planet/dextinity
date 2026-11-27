import { renderMailHtml } from "@dextinity/mail-react/client";
import dextinityConfig from "@src/dextinity-config.json";
import { MailRoot } from "@src/mail/components/MailRoot";
import type { Decorator } from "@storybook/nextjs-vite";
import { type ReactElement, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

const mailConfig = {
    pixelImageBlock: {
        validSizes: [...dextinityConfig.images.imageSizes, ...dextinityConfig.images.deviceSizes],
        baseUrl: "",
    },
};

// `@dextinity/mail-react/storybook` renders every story of a Storybook as a mail, so it can't be added to the site's Storybook.
// Mail stories use this decorator instead. The mail is rendered in a tree of its own, so it needs its own `IntlProvider`.
export const MailRendererDecorator: Decorator = (Story) => (
    <RenderedMail
        mail={
            <IntlProvider
                locale="en"
                defaultLocale="en"
                messages={{}}
                onError={() => {
                    // noop
                }}
            >
                <MailRoot config={mailConfig}>
                    <Story />
                </MailRoot>
            </IntlProvider>
        }
    />
);

const RenderedMail = ({ mail }: { mail: ReactElement }) => {
    const [html, setHtml] = useState("");

    useEffect(() => {
        let isOutdated = false;

        (async () => {
            const { html, mjmlWarnings } = await renderMailHtml(mail);
            if (isOutdated) {
                return;
            }

            for (const warning of mjmlWarnings) {
                console.warn("MJML warning:", warning);
            }

            setHtml(html);
        })();

        return () => {
            isOutdated = true;
        };
    }, [mail]);

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
