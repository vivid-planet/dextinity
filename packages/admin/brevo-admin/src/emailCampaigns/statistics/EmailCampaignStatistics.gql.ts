import { gql } from "@apollo/client";

export const emailCampaignStatisticsQuery = gql`
    query EmailCampaignStatistics($id: ID!) {
        brevoEmailCampaign(id: $id) {
            id
            title
            subject
            scheduledAt
            brevoTargetGroups {
                id
                title
            }
        }
        brevoEmailCampaignStatistics(id: $id) {
            sent
            delivered
            softBounces
            hardBounces
            uniqueViews
            uniqueClicks
            unsubscriptions
            complaints
        }
    }
`;
