import { gql } from "@apollo/client";

import { actionLogRowFragment } from "../../actionLog/actionLogsQuery";

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
        ...ActionLogRow
    }
    ${actionLogRowFragment}
`;

export const globalActionLogGridQuery = gql`
    query GlobalActionLogGrid($offset: Int!, $limit: Int!, $sort: [ActionLogSort!]) {
        allActionLogs(offset: $offset, limit: $limit, sort: $sort) {
            nodes {
                ...GlobalActionLogGrid
            }
            totalCount
        }
    }
    ${globalActionLogGridFragment}
`;
