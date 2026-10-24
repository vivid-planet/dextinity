import { gql } from "@dextinity/site-react";
import { notFound } from "@src/framework/navigation";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import { DefaultTitle } from "@src/layout/DefaultTitle";
import { NewsArticleJsonLd } from "@src/news/NewsArticleJsonLd";
import type { ContentScope } from "@src/site-configs";
import { createGraphQLFetch } from "@src/util/graphQLClient";

import { Content } from "./content";
import { fragment } from "./fragment";
import type { GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables } from "./page.generated";

export default async function NewsDetailPage({ domain, language, slug }: ContentScope & { slug: string }) {
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
            <DefaultTitle />
            <NewsArticleJsonLd news={data.newsBySlug} scope={scope} />
            <Content news={data.newsBySlug} />
        </>
    );
}
