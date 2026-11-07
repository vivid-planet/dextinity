import { gql } from "@apollo/client";

const emailCampaignsListFragment = gql`
    fragment EmailCampaignsList on BrevoEmailCampaign {
        id
        updatedAt
        title
        subject
        sendingState
        scheduledAt
        brevoId
        brevoTargetGroups {
            id
            title
        }
    }
`;

export const emailCampaignsListQuery = gql`
    query EmailCampaignsList(
        $offset: Int!
        $limit: Int!
        $sort: [EmailCampaignSort!]
        $search: String
        $filter: EmailCampaignFilter
        $scope: EmailCampaignContentScopeInput!
    ) {
        brevoEmailCampaigns(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter, scope: $scope) {
            nodes {
                ...EmailCampaignsList
            }
            totalCount
        }
        allEmailCampaigns: brevoEmailCampaigns(limit: 1, search: $search, scope: $scope) {
            totalCount
        }
        draftEmailCampaigns: brevoEmailCampaigns(limit: 1, search: $search, filter: { sendingState: { equal: DRAFT } }, scope: $scope) {
            totalCount
        }
        scheduledEmailCampaigns: brevoEmailCampaigns(limit: 1, search: $search, filter: { sendingState: { equal: SCHEDULED } }, scope: $scope) {
            totalCount
        }
        sentEmailCampaigns: brevoEmailCampaigns(limit: 1, search: $search, filter: { sendingState: { equal: SENT } }, scope: $scope) {
            totalCount
        }
    }
    ${emailCampaignsListFragment}
`;

export const deleteEmailCampaignMutation = gql`
    mutation DeleteEmailCampaign($id: ID!) {
        deleteBrevoEmailCampaign(id: $id)
    }
`;

export const emailCampaignContentQuery = gql`
    query EmailCampaignContent($id: ID!) {
        brevoEmailCampaign(id: $id) {
            id
            content
        }
    }
`;

export const duplicateEmailCampaignMutation = gql`
    mutation DuplicateEmailCampaign($scope: EmailCampaignContentScopeInput!, $input: EmailCampaignInput!) {
        createBrevoEmailCampaign(scope: $scope, input: $input) {
            id
        }
    }
`;
