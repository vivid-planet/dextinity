import { gql } from "@apollo/client";

const emailCampaignEditorFragment = gql`
    fragment EmailCampaignEditor on BrevoEmailCampaign {
        id
        updatedAt
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

export const emailCampaignEditorQuery = gql`
    query EmailCampaignEditor($id: ID!) {
        brevoEmailCampaign(id: $id) {
            ...EmailCampaignEditor
        }
    }
    ${emailCampaignEditorFragment}
`;

export const createEmailCampaignMutation = gql`
    mutation CreateEmailCampaign($scope: EmailCampaignContentScopeInput!, $input: EmailCampaignInput!) {
        createBrevoEmailCampaign(scope: $scope, input: $input) {
            ...EmailCampaignEditor
        }
    }
    ${emailCampaignEditorFragment}
`;

export const updateEmailCampaignMutation = gql`
    mutation UpdateEmailCampaign($id: ID!, $input: EmailCampaignUpdateInput!, $lastUpdatedAt: DateTime) {
        updateBrevoEmailCampaign(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            ...EmailCampaignEditor
        }
    }
    ${emailCampaignEditorFragment}
`;
