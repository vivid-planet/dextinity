import { gql } from "@apollo/client";

import { actionLogRowFragment } from "../../actionLog/actionLogsQuery";

export const globalActionLogGridQuery = gql`
    query GlobalActionLogGrid($offset: Int!, $limit: Int!, $sort: [ActionLogSort!]) {
        allActionLogs(offset: $offset, limit: $limit, sort: $sort) {
            nodes {
                ...ActionLogRow
            }
            totalCount
        }
    }
    ${actionLogRowFragment}
`;
