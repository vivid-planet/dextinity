import { gql } from "@apollo/client";
import { parse } from "graphql";

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

export function buildActionLogsQuery(queryName: string) {
    const operationName = queryName[0].toUpperCase() + queryName.slice(1);
    const fragmentsBody = actionLogDialogFragment.loc?.source.body ?? "";
    return parse(`
        query ${operationName}($scope: JSONObject!, $offset: Int!, $limit: Int!, $filter: ActionLogFilter, $sort: [ActionLogSort!]) {
            ${queryName}(scope: $scope, offset: $offset, limit: $limit, filter: $filter, sort: $sort) {
                nodes {
                    ...ActionLogDialog
                }
                totalCount
            }
        }
        ${fragmentsBody}
    `);
}
