export const dynamic = "error";

import { gql } from "@dextinity/site-nextjs";
import { setServerIntl } from "@dextinity/site-nextjs/server";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { NewsArticleJsonLd } from "@src/news/NewsArticleJsonLd";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { loadMessages } from "@src/util/loadMessages";
import { setVisibilityParam } from "@src/util/ServerContext";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { notFound } from "next/navigation";

import { Content } from "./content";
import { fragment } from "./fragment";
import type { GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables } from "./page.generated";

export default async function NewsDetailPage({ params }: PageProps<"/[visibility]/[domain]/[language]/news/[slug]">) {
    const { domain, language, slug, visibility } = await params;
    setVisibilityParam(visibility as VisibilityParam);
    if (!getSiteConfigForDomain(domain).scope.languages.includes(language)) {
        notFound();
    }
    setServerIntl(language, await loadMessages(language));
    const scope = { domain, language };
    const graphqlFetch = createGraphQLFetch();

    const data = await graphqlFetch<GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables>(
        gql`
            query NewsDetailPage($slug: String!, $scope: NewsContentScopeInput!) {
                newsBySlug(slug: $slug, scope: $scope) {
                    id
                    ...NewsDetailPage
                }
            }
            ${fragment}
        `,
        { slug, scope: scope as GQLNewsContentScopeInput },
    );

    if (data.newsBySlug === null) {
        notFound();
    }

    return (
        <>
            <NewsArticleJsonLd news={data.newsBySlug} scope={scope} />
            <Content news={data.newsBySlug} />
        </>
    );
}
