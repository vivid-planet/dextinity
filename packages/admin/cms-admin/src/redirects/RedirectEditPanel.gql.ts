import { gql } from "@apollo/client";

const redirectDetailFragment = gql`
    fragment RedirectDetail on Redirect {
        id
        active
        activatedAt
        sourceType
        source
        target
        comment
        generationType
        createdAt
        updatedAt
    }
`;

export const redirectDetailQuery = gql`
    query RedirectDetail($id: ID!) {
        redirect(id: $id) {
            ...RedirectDetail
        }
    }
    ${redirectDetailFragment}
`;

export const redirectSourceAvailableQuery = gql`
    query RedirectSourceAvailable($scope: RedirectScopeInput!, $source: String!) {
        redirectSourceAvailable(scope: $scope, source: $source)
    }
`;

export const updateRedirectMutation = gql`
    mutation UpdateRedirect($id: ID!, $lastUpdatedAt: DateTime, $input: RedirectInput!) {
        updateRedirect(id: $id, lastUpdatedAt: $lastUpdatedAt, input: $input) {
            ...RedirectDetail
        }
    }
    ${redirectDetailFragment}
`;

export const updateRedirectDetailActivenessMutation = gql`
    mutation UpdateRedirectDetailActiveness($id: ID!, $input: RedirectUpdateActivenessInput!) {
        updateRedirectActiveness(id: $id, input: $input) {
            ...RedirectDetail
        }
    }
    ${redirectDetailFragment}
`;

export const createRedirectMutation = gql`
    mutation CreateRedirect($scope: RedirectScopeInput!, $input: RedirectInput!) {
        createRedirect(scope: $scope, input: $input) {
            ...RedirectDetail
        }
    }
    ${redirectDetailFragment}
`;
