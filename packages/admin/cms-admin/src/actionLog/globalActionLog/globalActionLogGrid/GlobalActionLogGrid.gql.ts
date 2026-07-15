import { gql } from "@apollo/client";

import { actionLogShowVersionDialogFragment } from "../../actionLog/actionLogShowVersionDialog/ActionLogShowVersionDialog";

const globalActionLogGridFragment = gql`
    fragment GlobalActionLogGrid on ActionLog {
        id
        createdAt
        scope
        type
        entityName
        entityId
        user {
            id
            name
        }
        ...ActionLogShowVersionDialog
    }
    ${actionLogShowVersionDialogFragment}
`;

export const globalActionLogGridQuery = gql`
    query GlobalActionLogGrid($offset: Int!, $limit: Int!, $sort: [ActionLogSort!], $filter: ActionLogFilter) {
        allActionLogs(offset: $offset, limit: $limit, sort: $sort, filter: $filter) {
            nodes {
                ...GlobalActionLogGrid
            }
            totalCount
        }
    }
    ${globalActionLogGridFragment}
`;
