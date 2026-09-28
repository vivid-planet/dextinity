import { gql } from "@apollo/client";

import { actionLogCompareFragment } from "../components/actionLogCompare/ActionLogCompare";

export const actionLogRowFragment = gql`
    fragment ActionLogRow on ActionLog {
        id
        entityName
        entityId
        version
        type
        createdAt
        scope
        snapshot
        user {
            id
            name
        }
        previousVersion {
            snapshot
        }
        ...ActionLogCompare
    }
    ${actionLogCompareFragment}
`;

export const actionLogsQuery = gql`
    query ActionLogs($entity: String!, $scope: JSONObject!, $offset: Int!, $limit: Int!, $filter: ActionLogFilter, $sort: [ActionLogSort!]) {
        actionLogs(entity: $entity, scope: $scope, offset: $offset, limit: $limit, filter: $filter, sort: $sort) {
            nodes {
                ...ActionLogRow
            }
            totalCount
        }
    }
    ${actionLogRowFragment}
`;
