import { gql } from "@apollo/client";

const brevoConfigFormFragment = gql`
    fragment BrevoConfigForm on BrevoConfig {
        senderMail
        senderName
        doubleOptInTemplateId
        folderId
        allowedRedirectionUrl
        unsubscriptionPageId
    }
`;

export const brevoConfigFormQuery = gql`
    query BrevoConfigForm($scope: EmailCampaignContentScopeInput!) {
        brevoConfig(scope: $scope) {
            id
            updatedAt
            ...BrevoConfigForm
        }
    }
    ${brevoConfigFormFragment}
`;

export const createBrevoConfigMutation = gql`
    mutation CreateBrevoConfig($scope: EmailCampaignContentScopeInput!, $input: BrevoConfigInput!) {
        createBrevoConfig(scope: $scope, input: $input) {
            id
            updatedAt
            ...BrevoConfigForm
        }
    }
    ${brevoConfigFormFragment}
`;

export const updateBrevoConfigMutation = gql`
    mutation UpdateBrevoConfig($id: ID!, $input: BrevoConfigUpdateInput!, $lastUpdatedAt: DateTime) {
        updateBrevoConfig(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...BrevoConfigForm
        }
    }
    ${brevoConfigFormFragment}
`;

export const sendersSelectQuery = gql`
    query SendersSelect($scope: EmailCampaignContentScopeInput!) {
        brevoSenders(scope: $scope) {
            id
            name
            email
        }
    }
`;

export const doubleOptInTemplatesSelectQuery = gql`
    query DoubleOptInTemplatesSelect($scope: EmailCampaignContentScopeInput!) {
        brevoDoubleOptInTemplates(scope: $scope) {
            id
            name
        }
    }
`;
