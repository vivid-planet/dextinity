import { gql } from "@apollo/client";

export const actionLogCompareFragment = gql`
    fragment ActionLogCompare on ActionLog {
        id
        version
        snapshot
        createdAt
        user {
            id
            name
        }
        entityName
    }
`;
