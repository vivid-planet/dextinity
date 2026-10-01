import { gql } from "@apollo/client";

export const actionLogVersionGridFragment = gql`
    fragment ActionLogVersionGrid on ActionLog {
        id
        user {
            id
            name
        }
        entityName
        scope
        version
        type
        createdAt
        previousVersion {
            id
        }
    }
`;
