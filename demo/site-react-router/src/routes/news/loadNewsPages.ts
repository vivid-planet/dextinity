import { gql, type GraphQLFetch } from "@dextinity/site-react";
import { notFound } from "@dextinity/site-react-router";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import type { ContentScope } from "@src/site-configs";

import type { GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables } from "./loadNewsPages.generated";
import { newsDetailFragment } from "./newsDetailFragment";

/**
 * The news, the loader of the route checks that it exists, its server component gets it from the same request without querying it again
 */
export async function fetchNews({ scope, slug, graphQLFetch }: { scope: ContentScope; slug: string; graphQLFetch: GraphQLFetch }) {
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
    return news;
}
