import { gql } from "@dextinity/site-react";
import { notFound } from "@dextinity/site-vite-rsc";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import { NewsArticleJsonLd } from "@src/news/NewsArticleJsonLd";
import type { ContentScope } from "@src/site-configs";
import { graphQLFetch } from "@src/util/graphQLClient";

import { NewsDetailContent } from "./NewsDetailContent";
import { newsDetailFragment } from "./newsDetailFragment";
import type { GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables } from "./NewsDetailPage.generated";

export async function NewsDetailPage({ domain, language, slug }: ContentScope & { slug: string }) {
    const scope = { domain, language };
    const data = await graphQLFetch<GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables>(
        gql`
            query NewsDetailPage($slug: String!, $scope: NewsContentScopeInput!) {
                newsBySlug(slug: $slug, scope: $scope) {
                    id
                    ...NewsDetailPage
                }
            }
            ${newsDetailFragment}
        `,
        { slug, scope: scope as GQLNewsContentScopeInput },
    );

    if (data.newsBySlug === null) {
        notFound();
    }

    return (
        <>
            <title>{data.newsBySlug.title}</title>
            <NewsArticleJsonLd news={data.newsBySlug} scope={scope} />
            <NewsDetailContent news={data.newsBySlug} />
        </>
    );
}
