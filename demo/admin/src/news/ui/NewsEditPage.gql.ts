import { gql } from "@apollo/client";

const newsEditFragment = gql`
    fragment NewsUiEdit on News {
        id
        title
        slug
        date
        category
        status
        image
        content
        createdAt
        updatedAt
    }
`;

export const newsEditQuery = gql`
    query NewsUiEdit($id: ID!) {
        news(id: $id) {
            ...NewsUiEdit
        }
    }
    ${newsEditFragment}
`;

export const createNewsMutation = gql`
    mutation NewsUiCreate($scope: NewsContentScopeInput!, $input: NewsInput!) {
        createNews(scope: $scope, input: $input) {
            ...NewsUiEdit
        }
    }
    ${newsEditFragment}
`;

export const updateNewsMutation = gql`
    mutation NewsUiUpdate($id: ID!, $input: NewsUpdateInput!) {
        updateNews(id: $id, input: $input) {
            ...NewsUiEdit
        }
    }
    ${newsEditFragment}
`;

export const deleteNewsMutation = gql`
    mutation NewsUiEditDelete($id: ID!) {
        deleteNews(id: $id)
    }
`;
