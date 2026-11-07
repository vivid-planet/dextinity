import { type DocumentNode, gql } from "@apollo/client";

export const targetGroupFormQuery = (targetGroupFormFragment?: DocumentNode) => gql`
    query TargetGroupForm($id: ID!) {
        brevoTargetGroup(id: $id) {
            id
            title
            updatedAt
            brevoId
            isMainList
            totalSubscribers
            assignedContactsTargetGroupBrevoId
            ${targetGroupFormFragment ? "...TargetGroupForm" : ""}
        }
    }
    ${targetGroupFormFragment ?? ""}
`;

export const updateTargetGroupMutation = (targetGroupFormFragment?: DocumentNode) => gql`
    mutation UpdateTargetGroup($id: ID!, $input: TargetGroupUpdateInput!, $lastUpdatedAt: DateTime) {
        updateBrevoTargetGroup(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            title
            updatedAt
            ${targetGroupFormFragment ? "...TargetGroupForm" : ""}
        }
    }
    ${targetGroupFormFragment ?? ""}
`;
