import { gql } from "@apollo/client";

export const pageActivityQuery = gql`
    query OverviewPageActivity($scope: PageTreeNodeScopeInput!) {
        paginatedPageTreeNodes(offset: 0, limit: 100, scope: $scope, sort: [{ field: updatedAt, direction: DESC }]) {
            nodes {
                id
                name
                updatedAt
            }
            totalCount
        }
    }
`;

export const newsCountQuery = gql`
    query OverviewNewsCount($scope: NewsContentScopeInput!, $updatedSince: DateTime!) {
        newsList(scope: $scope, offset: 0, limit: 1) {
            totalCount
        }
        editedNews: newsList(scope: $scope, offset: 0, limit: 1, filter: { updatedAt: { greaterThanEqual: $updatedSince } }) {
            totalCount
        }
    }
`;
