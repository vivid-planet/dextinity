import { gql } from "@apollo/client";

export const globalActionLogGridFragment = gql`
    fragment GlobalActionLogGrid on ActionLog {
        id
        user {
            id
            name
        }
        entityName
        entityId
        version
        type
        createdAt
        scope
    }
`;

export const globalActionLogGridQuery = gql`
    query GlobalActionLogGrid($offset: Int!, $limit: Int!, $sort: [ActionLogSort!], $scopes: [JSONObject!]!) {
        actionLogs(offset: $offset, limit: $limit, sort: $sort, scopes: $scopes) {
            nodes {
                ...GlobalActionLogGrid
            }
            totalCount
        }
    }
    ${globalActionLogGridFragment}
`;
