import { gql } from "@apollo/client";

export const newsFormFragment = gql`
    fragment NewsForm on News {
        slug
        title
        date
        category
        image
        content
    }
`;
export const newsQuery = gql`
    query News($id: ID!) {
        news(id: $id) {
            id
            updatedAt
            ...NewsForm
        }
    }
    ${newsFormFragment}
`;
export const createNewsMutation = gql`
    mutation CreateNews($scope: NewsContentScopeInput!, $input: NewsInput!) {
        createNews(scope: $scope, input: $input) {
            id
            updatedAt
            ...NewsForm
        }
    }
    ${newsFormFragment}
`;
export const updateNewsMutation = gql`
    mutation UpdateNews($id: ID!, $input: NewsUpdateInput!) {
        updateNews(id: $id, input: $input) {
            id
            updatedAt
            ...NewsForm
        }
    }
    ${newsFormFragment}
`;
