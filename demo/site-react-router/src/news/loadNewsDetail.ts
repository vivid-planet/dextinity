import { gql, type GraphQLFetch } from "@dextinity/site-react-router";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import type { ContentScope } from "@src/site-configs";
import { data } from "react-router";

import type { GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables } from "./loadNewsDetail.generated";
import { newsDetailFragment } from "./newsDetailFragment";

const newsDetailPageQuery = gql`
    query NewsDetailPage($slug: String!, $scope: NewsContentScopeInput!) {
        newsBySlug(slug: $slug, scope: $scope) {
            id
            ...NewsDetailPage
        }
    }
    ${newsDetailFragment}
`;

/**
 * Loads a news in a loader, which responds with 404 if there's no news with the slug
 */
export async function loadNewsDetail({ scope, slug, graphQLFetch }: { scope: ContentScope; slug: string; graphQLFetch: GraphQLFetch }) {
    const { newsBySlug } = await graphQLFetch<GQLNewsDetailPageQuery, GQLNewsDetailPageQueryVariables>(newsDetailPageQuery, {
        slug,
        scope: scope as GQLNewsContentScopeInput,
    });
    if (!newsBySlug) {
        throw data(null, { status: 404 });
    }
    return newsBySlug;
}
