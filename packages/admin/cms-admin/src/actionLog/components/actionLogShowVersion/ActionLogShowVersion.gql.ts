import { gql } from "@apollo/client";

export const actionLogShowVersionFragment = gql`
    fragment ActionLogShowVersion on ActionLog {
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
