import { gql } from "@apollo/client";

import { brevoContactsListItemFragment } from "../../brevoContacts/brevoContactsListItemFragment";

export const manuallyAddedContactsQuery = gql`
    query TargetGroupManuallyAddedContacts($offset: Int!, $limit: Int!, $email: String, $targetGroupId: ID!) {
        manuallyAssignedBrevoContacts(offset: $offset, limit: $limit, email: $email, targetGroupId: $targetGroupId) {
            nodes {
                ...BrevoContactsListItem
            }
            totalCount
        }
    }
    ${brevoContactsListItemFragment}
`;

export const assignedContactsQuery = gql`
    query TargetGroupAssignedContacts($offset: Int!, $limit: Int!, $email: String, $targetGroupId: ID!, $scope: EmailCampaignContentScopeInput!) {
        brevoContacts(offset: $offset, limit: $limit, email: $email, targetGroupId: $targetGroupId, scope: $scope) {
            nodes {
                ...BrevoContactsListItem
            }
            totalCount
        }
    }
    ${brevoContactsListItemFragment}
`;

export const removeContactFromTargetGroupMutation = gql`
    mutation RemoveBrevoContactFromTargetGroup($id: ID!, $input: RemoveBrevoContactInput!) {
        removeBrevoContactFromTargetGroup(id: $id, input: $input)
    }
`;
