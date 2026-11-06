import { gql } from "@apollo/client";

export const newsListQuery = gql`
    query NewsUiList(
        $scope: NewsContentScopeInput!
        $offset: Int!
        $limit: Int!
        $sort: [NewsSort!]
        $search: String
        $filter: NewsFilter
        $countFilter: NewsFilter!
    ) {
        newsList(scope: $scope, offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter) {
            nodes {
                id
                title
                slug
                date
                category
                status
                updatedAt
            }
            totalCount
        }
        totalNews: newsList(scope: $scope, limit: 1) {
            totalCount
        }
        allNews: newsList(scope: $scope, limit: 1, search: $search, filter: $countFilter) {
            totalCount
        }
        activeNews: newsList(scope: $scope, limit: 1, search: $search, filter: { and: [$countFilter, { status: { equal: active } }] }) {
            totalCount
        }
        deletedNews: newsList(scope: $scope, limit: 1, search: $search, filter: { and: [$countFilter, { status: { equal: deleted } }] }) {
            totalCount
        }
    }
`;

export const updateNewsStatusMutation = gql`
    mutation NewsUiUpdateStatus($id: ID!, $status: NewsStatus!) {
        updateNews(id: $id, input: { status: $status }) {
            id
            status
            updatedAt
        }
    }
`;

export const deleteNewsMutation = gql`
    mutation NewsUiDelete($id: ID!) {
        deleteNews(id: $id)
    }
`;
