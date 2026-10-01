import { gql } from "@apollo/client";

import { actionLogShowVersionDialogFragment } from "../actionLogShowVersionDialog/ActionLogShowVersionDialog";

const actionLogsGridFragment = gql`
    fragment ActionLogsGrid on ActionLog {
        id
        entityId
        type
        createdAt
        snapshot
        user {
            id
            name
        }
        previousVersion {
            snapshot
        }
        ...ActionLogShowVersionDialog
    }
    ${actionLogShowVersionDialogFragment}
`;

export const actionLogsGridQuery = gql`
    query ActionLogs($entity: String!, $scope: JSONObject!, $offset: Int!, $limit: Int!, $filter: ActionLogFilter, $sort: [ActionLogSort!]) {
        actionLogs(entity: $entity, scope: $scope, offset: $offset, limit: $limit, filter: $filter, sort: $sort) {
            nodes {
                ...ActionLogsGrid
            }
            totalCount
        }
    }
    ${actionLogsGridFragment}
`;
