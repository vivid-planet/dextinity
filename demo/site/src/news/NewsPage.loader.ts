import { gql } from "@dextinity/site-nextjs";
import type { GQLNewsContentScopeInput } from "@src/graphql.generated";
import { createGraphQLFetch } from "@src/util/graphQLClient";

import type { GQLNewsIndexPageQuery, GQLNewsIndexPageQueryVariables } from "./NewsPage.loader.generated";

const newsFragment = gql`
    fragment NewsListItem on News {
        id
        title
        slug
        image
        createdAt
        scope {
            language
        }
    }
`;

type NewsListParams = {
    scope: GQLNewsContentScopeInput;
    offset?: number;
    limit: number;
};

export async function fetchNewsList(params: NewsListParams) {
    const graphqlFetch = createGraphQLFetch();

    const { newsList } = await graphqlFetch<GQLNewsIndexPageQuery, GQLNewsIndexPageQueryVariables>(
        gql`
            query NewsIndexPage($scope: NewsContentScopeInput!, $sort: [NewsSort!]!, $offset: Int!, $limit: Int!) {
                newsList(scope: $scope, sort: $sort, offset: $offset, limit: $limit) {
                    nodes {
                        ...NewsListItem
                    }
                    totalCount
                }
            }
            ${newsFragment}
        `,
        {
            scope: params.scope,
            sort: [{ field: "date", direction: "DESC" }],
            offset: params.offset || 0,
            limit: params.limit,
        },
    );
    return newsList;
}
