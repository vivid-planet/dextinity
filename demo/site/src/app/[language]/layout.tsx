import { gql } from "@dextinity/site-react";
import { Footer } from "@src/layout/footer/Footer";
import { footerFragment } from "@src/layout/footer/Footer.fragment";
import { Header } from "@src/layout/header/Header";
import { headerFragment } from "@src/layout/header/Header.fragment";
import { TopNavigation } from "@src/layout/topNavigation/TopNavigation";
import { topMenuPageTreeNodeFragment } from "@src/layout/topNavigation/TopNavigation.fragment";
import { OrganizationJsonLd } from "@src/organization/OrganizationJsonLd";
import type { ContentScope } from "@src/site-configs";
import { graphQLFetch } from "@src/util/graphQLClient";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import { getSiteContext } from "@src/util/siteContext";
import { SitePreviewProvider } from "@src/util/SitePreviewProvider";
import type { PropsWithChildren } from "react";

import type { GQLLayoutQuery, GQLLayoutQueryVariables } from "./layout.generated";

export function getLayoutLanguage({ domain, language }: ContentScope) {
    return getSiteConfigForDomain(domain).scope.languages.includes(language) ? language : "en";
}

export default async function Layout({ children, ...params }: PropsWithChildren<ContentScope>) {
    const { domain } = params;
    const siteConfig = getSiteConfigForDomain(domain);
    const language = getLayoutLanguage(params);

    const { footer, header, topMenu } = await graphQLFetch<GQLLayoutQuery, GQLLayoutQueryVariables>(
        gql`
            query Layout($domain: String!, $language: String!) {
                footer: footer(scope: { domain: $domain, language: $language }) {
                    ...Footer
                }
                header: mainMenu(scope: { domain: $domain, language: $language }) {
                    ...Header
                }
                topMenu(scope: { domain: $domain, language: $language }) {
                    ...TopMenuPageTreeNode
                }
            }

            ${footerFragment}
            ${headerFragment}
            ${topMenuPageTreeNodeFragment}
        `,
        { domain, language },
    );

    const messages = await loadMessages(language);
    const isSitePreview = getSiteContext().sitePreview !== undefined;

    if (footer) {
        footer.content = await recursivelyLoadBlockData({
            blockData: footer.content,
            blockType: "FooterContent",
            graphQLFetch,
            fetch,
            scope: { domain, language },
        });
    }

    const content = (
        <IntlProvider locale={language} messages={messages}>
            <OrganizationJsonLd siteConfig={siteConfig} />
            <TopNavigation data={topMenu} />
            <Header header={header} />
            {children}
            {footer && <Footer footer={footer} />}
        </IntlProvider>
    );

    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            {isSitePreview ? <SitePreviewProvider>{content}</SitePreviewProvider> : content}
        </SiteConfigProvider>
    );
}
