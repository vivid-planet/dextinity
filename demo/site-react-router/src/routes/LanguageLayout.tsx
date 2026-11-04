import { gql } from "@dextinity/site-react";
import { Footer } from "@src/layout/footer/Footer";
import { footerFragment } from "@src/layout/footer/Footer.fragment";
import { Header } from "@src/layout/header/Header";
import { headerFragment } from "@src/layout/header/Header.fragment";
import { TopNavigation } from "@src/layout/topNavigation/TopNavigation";
import { topMenuPageTreeNodeFragment } from "@src/layout/topNavigation/TopNavigation.fragment";
import { OrganizationJsonLd } from "@src/organization/OrganizationJsonLd";
import { getGraphQLFetch } from "@src/util/graphQLClient.server";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages.server";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { getSiteConfigForDomain } from "@src/util/siteConfig.server";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import { getSiteContext } from "@src/util/siteContext";
import { Outlet, type ShouldRevalidateFunctionArgs } from "react-router";

import type { Route } from "./+types/LanguageLayout";
import type { GQLLayoutQuery, GQLLayoutQueryVariables } from "./LanguageLayout.generated";

const layoutQuery = gql`
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
`;

export async function loader({ params, context }: Route.LoaderArgs) {
    const { domain } = getSiteContext(context);
    const siteConfig = getSiteConfigForDomain(domain);
    // Paths with an unknown language, e.g. redirect sources, are rendered in the default language
    const language = siteConfig.scope.languages.includes(params.language) ? params.language : "en";
    const graphQLFetch = getGraphQLFetch(context);

    const [{ footer, header, topMenu }, messages] = await Promise.all([
        graphQLFetch<GQLLayoutQuery, GQLLayoutQueryVariables>(layoutQuery, { domain, language }),
        loadMessages(language),
    ]);

    if (footer) {
        footer.content = await recursivelyLoadBlockData({
            blockData: footer.content,
            blockType: "FooterContent",
            graphQLFetch,
            fetch,
            scope: { domain, language },
        });
    }

    return { siteConfig, scope: { domain, language }, messages, footer, header, topMenu };
}

// The layout only depends on the language, so client navigations within a language don't load it again
export function shouldRevalidate({ currentParams, nextParams, defaultShouldRevalidate, formMethod }: ShouldRevalidateFunctionArgs) {
    if (formMethod && formMethod !== "GET") {
        return defaultShouldRevalidate;
    }
    return currentParams.language !== nextParams.language;
}

export default function LanguageLayout({ loaderData: { siteConfig, scope, messages, footer, header, topMenu } }: Route.ComponentProps) {
    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            <IntlProvider locale={scope.language} messages={messages}>
                <OrganizationJsonLd siteConfig={siteConfig} />
                <TopNavigation data={topMenu} />
                <Header header={header} />
                <Outlet />
                {footer && <Footer footer={footer} />}
            </IntlProvider>
        </SiteConfigProvider>
    );
}
