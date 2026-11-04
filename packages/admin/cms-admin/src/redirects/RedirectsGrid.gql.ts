import { gql } from "@apollo/client";

import { redirectActivenessFragment } from "./RedirectActiveness";

// @TODO: consider content-scope in query
//
const redirectTableFragment = gql`
    fragment RedirectTable on Redirect {
        id
        active
        activatedAt
        sourceType
        source
        target
        comment
        generationType
        ...RedirectActiveness
    }
    ${redirectActivenessFragment}
`;

export const paginatedRedirectsQuery = gql`
    query PaginatedRedirects(
        $scope: RedirectScopeInput!
        $filter: RedirectFilter
        $search: String
        $sort: [RedirectSort!]
        $offset: Int
        $limit: Int
    ) {
        paginatedRedirects(scope: $scope, filter: $filter, search: $search, sort: $sort, offset: $offset, limit: $limit) {
            nodes {
                ...RedirectTable
            }
            totalCount
        }
    }
    ${redirectTableFragment}
`;

export const deleteRedirectMutation = gql`
    mutation DeleteRedirect($id: ID!) {
        deleteRedirect(id: $id)
    }
`;

export const deleteRedirectsMutation = gql`
    mutation DeleteRedirects($ids: [ID!]!) {
        deleteRedirects(ids: $ids)
    }
`;
