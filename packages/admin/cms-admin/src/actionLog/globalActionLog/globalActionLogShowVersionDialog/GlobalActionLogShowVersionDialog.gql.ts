import { gql } from "@apollo/client";

import { actionLogCompareFragment } from "../../components/actionLogCompare/ActionLogCompare";

export const globalActionLogShowVersionQuery = gql`
    query GlobalActionLogShowVersion($id: ID!) {
        actionLog(id: $id) {
            ...ActionLogCompare
            previousVersion {
                ...ActionLogCompare
            }
        }
    }
    ${actionLogCompareFragment}
`;
