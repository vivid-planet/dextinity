import { gql } from "@apollo/client";

export const productsCountQuery = gql`
    query OverviewProductsCount {
        products(offset: 0, limit: 1) {
            totalCount
        }
    }
`;

export const redirectsCountQuery = gql`
    query OverviewRedirectsCount($scope: RedirectScopeInput!) {
        paginatedRedirects(scope: $scope, offset: 0, limit: 1, filter: { active: { equal: true } }) {
            totalCount
        }
    }
`;

export const warningsCountQuery = gql`
    query OverviewWarningsCount($scopes: [JSONObject!]!) {
        warnings(scopes: $scopes, offset: 0, limit: 1) {
            totalCount
        }
    }
`;
