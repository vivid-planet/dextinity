import { gql } from "@apollo/client";

import { actionLogCompareFragment } from "../../components/actionLogCompare/ActionLogCompare";
import { actionLogShowVersionFragment } from "../../components/actionLogShowVersion/ActionLogShowVersion";

export const actionLogShowVersionDialogFragment = gql`
    fragment ActionLogShowVersionDialog on ActionLog {
        entityId
        ...ActionLogCompare
        ...ActionLogShowVersion
        previousVersion {
            ...ActionLogCompare
        }
    }
    ${actionLogCompareFragment}
    ${actionLogShowVersionFragment}
`;
