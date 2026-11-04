import { gql, type GraphQLFetch } from "@dextinity/site-react";
import { notFound } from "@dextinity/site-react-router";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import { fetchNewsList } from "@src/news/NewsPage.loader";
import type { ContentScope } from "@src/site-configs";

import type { GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables } from "./loadNewsPages.server.generated";
import { newsDetailFragment } from "./newsDetailFragment";

export async function loadNewsIndexPage({ scope, graphQLFetch }: { scope: ContentScope; graphQLFetch: GraphQLFetch }) {
    return { scope, initialData: await fetchNewsList({ graphQLFetch, scope, limit: 2 }) };
}

export async function loadNewsDetailPage({ scope, slug, graphQLFetch }: { scope: ContentScope; slug: string; graphQLFetch: GraphQLFetch }) {
    const { newsBySlug: news } = await graphQLFetch<GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables>(
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

    if (news === null) {
        notFound();
    }

    return { scope, news, metadata: [{ title: news.title }] };
}
