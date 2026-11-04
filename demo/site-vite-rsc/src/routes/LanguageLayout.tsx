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
import { type PropsWithChildren, Suspense } from "react";

import type { GQLLayoutFooterQuery, GQLLayoutFooterQueryVariables, GQLLayoutQuery, GQLLayoutQueryVariables } from "./LanguageLayout.generated";

export function getLayoutLanguage({ domain, language }: ContentScope) {
    return getSiteConfigForDomain(domain).scope.languages.includes(language) ? language : "en";
}

async function LanguageFooter(scope: ContentScope) {
    const { footer } = await graphQLFetch<GQLLayoutFooterQuery, GQLLayoutFooterQueryVariables>(
        gql`
            query LayoutFooter($domain: String!, $language: String!) {
                footer: footer(scope: { domain: $domain, language: $language }) {
                    ...Footer
                }
            }

            ${footerFragment}
        `,
        scope,
    );
    if (!footer) {
        return null;
    }
    const content = await recursivelyLoadBlockData({ blockData: footer.content, blockType: "FooterContent", graphQLFetch, fetch, scope });
    return <Footer footer={{ ...footer, content }} />;
}

export async function LanguageLayout({ children, ...params }: PropsWithChildren<ContentScope>) {
    const { domain } = params;
    const siteConfig = getSiteConfigForDomain(domain);
    const language = getLayoutLanguage(params);

    const { header, topMenu } = await graphQLFetch<GQLLayoutQuery, GQLLayoutQueryVariables>(
        gql`
            query Layout($domain: String!, $language: String!) {
                header: mainMenu(scope: { domain: $domain, language: $language }) {
                    ...Header
                }
                topMenu(scope: { domain: $domain, language: $language }) {
                    ...TopMenuPageTreeNode
                }
            }

            ${headerFragment}
            ${topMenuPageTreeNodeFragment}
        `,
        { domain, language },
    );

    const messages = await loadMessages(language);

    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            <IntlProvider locale={language} messages={messages}>
                <OrganizationJsonLd siteConfig={siteConfig} />
                <TopNavigation data={topMenu} />
                <Header header={header} />
                {children}
                {/* Below the fold, streamed responses show the page before it */}
                <Suspense>
                    <LanguageFooter domain={domain} language={language} />
                </Suspense>
            </IntlProvider>
        </SiteConfigProvider>
    );
}
