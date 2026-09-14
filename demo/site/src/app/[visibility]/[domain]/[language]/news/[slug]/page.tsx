export const dynamic = "error";

import { gql } from "@dextinity/site-nextjs";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { setVisibilityParam } from "@src/util/ServerContext";
import { notFound } from "next/navigation";

import { Content } from "./content";
import { fragment } from "./fragment";
import type { GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables } from "./page.generated";

export default async function NewsDetailPage({ params }: PageProps<"/[visibility]/[domain]/[language]/news/[slug]">) {
    const { domain, language, slug, visibility } = await params;
    setVisibilityParam(visibility as VisibilityParam);
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
        { slug, scope: { domain: domain, language: language } as GQLNewsContentScopeInput },
    );

    if (data.newsBySlug === null) {
        notFound();
    }

    return <Content news={data.newsBySlug} />;
}
