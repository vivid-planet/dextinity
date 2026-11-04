import { gql } from "@dextinity/site-react-router";
import { Footer } from "@src/layout/footer/Footer";
import { footerFragment } from "@src/layout/footer/Footer.fragment";
import { Header } from "@src/layout/header/Header";
import { headerFragment } from "@src/layout/header/Header.fragment";
import { TopNavigation } from "@src/layout/topNavigation/TopNavigation";
import { topMenuPageTreeNodeFragment } from "@src/layout/topNavigation/TopNavigation.fragment";
import { OrganizationJsonLd } from "@src/organization/OrganizationJsonLd";
import type { ContentScope } from "@src/site-configs";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { getSiteContext } from "@src/util/siteContext";
import { Outlet } from "react-router";

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

/**
 * The scope of the layout: paths with a language that the site doesn't have, e.g. the source of a redirect, are rendered in English
 */
export function loader({ params, context }: Route.LoaderArgs) {
    const { domain, siteConfig } = getSiteContext(context);
    const language = siteConfig.scope.languages.includes(params.language) ? params.language : "en";
    const scope: ContentScope = { domain, language };
    return { scope };
}

/**
 * The layout with the header and the footer, the counterpart of `[visibility]/[domain]/[language]/layout.tsx` of the Next.js site
 */
export async function ServerComponent({ loaderData: { scope } }: Route.ServerComponentProps) {
    const { siteConfig } = getSiteContext();
    const graphQLFetch = createGraphQLFetch();

    const [{ footer, header, topMenu }, messages] = await Promise.all([
        graphQLFetch<GQLLayoutQuery, GQLLayoutQueryVariables>(layoutQuery, scope),
        loadMessages(scope.language),
    ]);

    if (footer) {
        footer.content = await recursivelyLoadBlockData({ blockData: footer.content, blockType: "FooterContent", graphQLFetch, fetch, scope });
    }

    return (
        <IntlProvider locale={scope.language} messages={messages}>
            <OrganizationJsonLd siteConfig={siteConfig} />
            <TopNavigation data={topMenu} />
            <Header header={header} />
            <Outlet />
            {footer && <Footer footer={footer} />}
        </IntlProvider>
    );
}
