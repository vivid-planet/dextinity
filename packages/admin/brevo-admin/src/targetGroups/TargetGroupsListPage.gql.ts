import { gql } from "@apollo/client";

export const targetGroupsListQuery = gql`
    query TargetGroupsList($offset: Int!, $limit: Int!, $sort: [TargetGroupSort!], $search: String, $scope: EmailCampaignContentScopeInput!) {
        brevoTargetGroups(offset: $offset, limit: $limit, sort: $sort, search: $search, scope: $scope) {
            nodes {
                id
                title
                totalSubscribers
                isMainList
                updatedAt
            }
            totalCount
        }
    }
`;

export const deleteTargetGroupMutation = gql`
    mutation DeleteTargetGroup($id: ID!) {
        deleteBrevoTargetGroup(id: $id)
    }
`;

export const duplicateTargetGroupMutation = gql`
    mutation DuplicateTargetGroup($scope: EmailCampaignContentScopeInput!, $input: TargetGroupInput!) {
        createBrevoTargetGroup(scope: $scope, input: $input) {
            id
        }
    }
`;
