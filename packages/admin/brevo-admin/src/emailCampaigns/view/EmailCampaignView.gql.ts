import { gql } from "@apollo/client";

export const emailCampaignViewQuery = gql`
    query EmailCampaignView($id: ID!) {
        brevoEmailCampaign(id: $id) {
            id
            title
            subject
            sendingState
            scheduledAt
            updatedAt
            content
            brevoTargetGroups {
                id
                title
            }
        }
    }
`;
