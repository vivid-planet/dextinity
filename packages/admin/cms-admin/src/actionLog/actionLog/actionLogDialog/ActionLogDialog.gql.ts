import { gql } from "@apollo/client";

import { actionLogCompareFragment } from "../../components/actionLogCompare/ActionLogCompare";
import { actionLogShowVersionFragment } from "../../components/actionLogShowVersion/ActionLogShowVersion";
import { actionLogVersionGridFragment } from "../actionLogVersionGrid/ActionLogVersionGrid";

const actionLogDialogFragment = gql`
    fragment ActionLogDialog on ActionLog {
        ...ActionLogVersionGrid
        ...ActionLogShowVersion
        ...ActionLogCompare
    }
    ${actionLogVersionGridFragment}
    ${actionLogShowVersionFragment}
    ${actionLogCompareFragment}
`;

export const actionLogDialogQuery = gql`
    query ActionLogDialog($entity: String!, $scope: JSONObject!, $offset: Int!, $limit: Int!, $filter: ActionLogFilter, $sort: [ActionLogSort!]) {
        actionLogs(entity: $entity, scope: $scope, offset: $offset, limit: $limit, filter: $filter, sort: $sort) {
            nodes {
                ...ActionLogDialog
            }
            totalCount
        }
    }
    ${actionLogDialogFragment}
`;
