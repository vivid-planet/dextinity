import { gql } from "@apollo/client";

const emailCampaignFormFragment = gql`
    fragment EmailCampaignForm on BrevoEmailCampaign {
        title
        subject
        scheduledAt
        content
        sendingState
        brevoTargetGroups {
            id
            title
        }
    }
`;

export const emailCampaignFormQuery = gql`
    query EmailCampaignForm($id: ID!) {
        brevoEmailCampaign(id: $id) {
            id
            updatedAt
            ...EmailCampaignForm
        }
    }
    ${emailCampaignFormFragment}
`;

export const createEmailCampaignMutation = gql`
    mutation CreateEmailCampaign($scope: EmailCampaignContentScopeInput!, $input: EmailCampaignInput!) {
        brevoEmailCampaign: createBrevoEmailCampaign(scope: $scope, input: $input) {
            id
            updatedAt
            ...EmailCampaignForm
        }
    }
    ${emailCampaignFormFragment}
`;

export const updateEmailCampaignMutation = gql`
    mutation UpdateEmailCampaign($id: ID!, $input: EmailCampaignUpdateInput!, $lastUpdatedAt: DateTime) {
        brevoEmailCampaign: updateBrevoEmailCampaign(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...EmailCampaignForm
        }
    }
    ${emailCampaignFormFragment}
`;
