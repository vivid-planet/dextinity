import { gql } from "@apollo/client";

const redirectsListFragment = gql`
    fragment RedirectsListItem on Redirect {
        id
        active
        activatedAt
        sourceType
        source
        target
        comment
        generationType
    }
`;

export const paginatedRedirectsQuery = gql`
    query PaginatedRedirects(
        $scope: RedirectScopeInput!
        $filter: RedirectFilter
        $countFilter: RedirectFilter
        $activeFilter: RedirectFilter
        $inactiveFilter: RedirectFilter
        $search: String
        $sort: [RedirectSort!]
        $offset: Int
        $limit: Int
    ) {
        paginatedRedirects(scope: $scope, filter: $filter, search: $search, sort: $sort, offset: $offset, limit: $limit) {
            nodes {
                ...RedirectsListItem
            }
            totalCount
        }
        allRedirects: paginatedRedirects(scope: $scope, filter: $countFilter, search: $search, limit: 1) {
            totalCount
        }
        activeRedirects: paginatedRedirects(scope: $scope, filter: $activeFilter, search: $search, limit: 1) {
            totalCount
        }
        inactiveRedirects: paginatedRedirects(scope: $scope, filter: $inactiveFilter, search: $search, limit: 1) {
            totalCount
        }
        totalRedirects: paginatedRedirects(scope: $scope, limit: 1) {
            totalCount
        }
    }
    ${redirectsListFragment}
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

export const updateRedirectActivenessMutation = gql`
    mutation UpdateRedirectActiveness($id: ID!, $input: RedirectUpdateActivenessInput!) {
        updateRedirectActiveness(id: $id, input: $input) {
            __typename
            id
            active
            activatedAt
        }
    }
`;
