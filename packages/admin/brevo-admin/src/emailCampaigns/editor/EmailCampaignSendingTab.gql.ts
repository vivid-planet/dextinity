import { gql } from "@apollo/client";

const targetGroupOptionFragment = gql`
    fragment EmailCampaignTargetGroupOption on BrevoTargetGroup {
        id
        title
    }
`;

export const targetGroupOptionsQuery = gql`
    query EmailCampaignTargetGroupOptions($scope: EmailCampaignContentScopeInput!, $search: String) {
        brevoTargetGroups(scope: $scope, search: $search, limit: 100) {
            nodes {
                ...EmailCampaignTargetGroupOption
            }
        }
    }
    ${targetGroupOptionFragment}
`;

export const sendEmailCampaignNowMutation = gql`
    mutation SendEmailCampaignNow($id: ID!) {
        sendBrevoEmailCampaignNow(id: $id)
    }
`;
