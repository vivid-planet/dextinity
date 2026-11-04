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
import { Outlet, type ShouldRevalidateFunctionArgs } from "react-router";

import type { Route } from "./+types/LanguageLayout";
import type { GQLLayoutQuery, GQLLayoutQueryVariables } from "./LanguageLayout.generated";

// Paths with an unknown language, e.g. redirect sources, are rendered in the default language
function getLayoutLanguage({ domain, language }: ContentScope) {
    return getSiteConfigForDomain(domain).scope.languages.includes(language) ? language : "en";
}

/**
 * The scope of the layout, also for the document language and the not found page
 */
export function loader({ params, context }: Route.LoaderArgs) {
    const { domain } = getSiteContext(context);
    return { scope: { domain, language: getLayoutLanguage({ domain, language: params.language }) } };
}

// The layout only depends on the language, so client navigations within a language don't render it again
export function shouldRevalidate({ currentParams, nextParams, defaultShouldRevalidate, formMethod }: ShouldRevalidateFunctionArgs) {
    if (formMethod && formMethod !== "GET") {
        return defaultShouldRevalidate;
    }
    return currentParams.language !== nextParams.language;
}

export async function ServerComponent({ loaderData: { scope } }: Route.ServerComponentProps) {
    const { domain, language } = scope;
    const siteConfig = getSiteConfigForDomain(domain);

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

    if (footer) {
        footer.content = await recursivelyLoadBlockData({
            blockData: footer.content,
            blockType: "FooterContent",
            graphQLFetch,
            fetch,
            scope: { domain, language },
        });
    }

    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            <IntlProvider locale={language} messages={messages}>
                <OrganizationJsonLd siteConfig={siteConfig} />
                <TopNavigation data={topMenu} />
                <Header header={header} />
                <Outlet />
                {footer && <Footer footer={footer} />}
            </IntlProvider>
        </SiteConfigProvider>
    );
}
