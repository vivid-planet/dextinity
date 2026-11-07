import { gql } from "@apollo/client";

export const testContactOptionsQuery = gql`
    query EmailCampaignTestContactOptions($scope: EmailCampaignContentScopeInput!, $email: String) {
        brevoTestContacts(scope: $scope, email: $email, limit: 100) {
            nodes {
                id
                email
            }
        }
    }
`;

export const sendEmailCampaignToTestEmailsMutation = gql`
    mutation SendEmailCampaignToTestEmails($id: ID!, $data: SendTestEmailCampaignArgs!) {
        sendBrevoEmailCampaignToTestEmails(id: $id, data: $data)
    }
`;
