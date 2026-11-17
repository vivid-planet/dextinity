import { DefaultTitle } from "@src/layout/DefaultTitle";
import type { ContentScope } from "@src/site-configs";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import type { PropsWithChildren } from "react";

export async function BlockPreviewLayout({ children, domain, language }: PropsWithChildren<ContentScope>) {
    const messages = await loadMessages(language);
    return (
        <SiteConfigProvider siteConfig={getSiteConfigForDomain(domain)}>
            <IntlProvider locale={language} messages={messages}>
                <DefaultTitle />
                {children}
            </IntlProvider>
        </SiteConfigProvider>
    );
}
