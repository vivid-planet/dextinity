import { gql } from "@apollo/client";

import { brevoContactsListItemFragment } from "../../brevoContacts/brevoContactsListItemFragment";

export const assignableContactsQuery = gql`
    query TargetGroupAssignableContacts($offset: Int!, $limit: Int!, $email: String, $scope: EmailCampaignContentScopeInput!) {
        brevoContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
            nodes {
                ...BrevoContactsListItem
            }
            totalCount
        }
    }
    ${brevoContactsListItemFragment}
`;

export const addContactsToTargetGroupMutation = gql`
    mutation AddBrevoContactsToTargetGroup($id: ID!, $input: AddBrevoContactsInput!) {
        addBrevoContactsToTargetGroup(id: $id, input: $input)
    }
`;
