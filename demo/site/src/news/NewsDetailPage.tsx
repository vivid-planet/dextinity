import { gql } from "@dextinity/site-nextjs";
import { createSitePathForPredefinedPage, type PredefinedPage } from "@src/documents/predefinedPages/predefinedPages";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { notFound } from "next/navigation";

import { NewsArticleJsonLd } from "./NewsArticleJsonLd";
import { NewsDetail } from "./NewsDetail";
import { newsDetailFragment } from "./NewsDetail.fragment";
import type { GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables } from "./NewsDetailPage.generated";

type Props = {
    slug: string;
    newsPredefinedPage: PredefinedPage;
};

export async function NewsDetailPage({ slug, newsPredefinedPage }: Props) {
    const { scope } = newsPredefinedPage;
    const graphqlFetch = createGraphQLFetch();

    const data = await graphqlFetch<GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables>(
        gql`
            query NewsDetailPage($slug: String!, $scope: NewsContentScopeInput!) {
                newsBySlug(slug: $slug, scope: $scope) {
                    id
                    ...NewsDetail
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
            <NewsArticleJsonLd news={data.newsBySlug} scope={scope} sitePath={createSitePathForPredefinedPage(newsPredefinedPage, `/${slug}`)} />
            <NewsDetail news={data.newsBySlug} />
        </>
    );
}
