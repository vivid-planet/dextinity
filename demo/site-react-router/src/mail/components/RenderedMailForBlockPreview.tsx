import { type Config, useRefToRegisterMailBlocksForPreview } from "@dextinity/mail-react";
import { useIFrameBridge } from "@dextinity/site-react";
import { createMailConfig } from "@src/mail/util/createMailConfig";
import { useSiteConfig } from "@src/util/SiteConfigProvider";
import { type FC, type ReactElement, useEffect, useState } from "react";
import { type IntlConfig, useIntl } from "react-intl";

type MailProps = {
    config: Config;
    locale: string;
    messages: IntlConfig["messages"];
};

interface Props {
    mail: (props: MailProps) => ReactElement;
    /** Applied to the rendered HTML, for mails whose placeholders need substituting before display. */
    transformHtml?: (html: string) => string;
}

export const RenderedMailForBlockPreview: FC<Props> = ({ mail, transformHtml }) => {
    const [mailHtml, setMailHtml] = useState<string>("");
    const mailContainerRef = useRefToRegisterMailBlocksForPreview<HTMLSpanElement>(useIFrameBridge());
    const { locale, messages } = useIntl();
    const { url } = useSiteConfig();

    useEffect(() => {
        (async () => {
            const { renderMailHtml } = await import("@dextinity/mail-react/client");
            const { html, mjmlWarnings } = renderMailHtml(mail({ config: createMailConfig(url), locale, messages }));

            if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
                console.warn(`${mjmlWarnings.length} MJML warnings`, mjmlWarnings);
            }

            setMailHtml(transformHtml ? transformHtml(html) : html);
        })();
    }, [mail, transformHtml, url, locale, messages]);

    return <span ref={mailContainerRef} dangerouslySetInnerHTML={{ __html: mailHtml }} />;
};
