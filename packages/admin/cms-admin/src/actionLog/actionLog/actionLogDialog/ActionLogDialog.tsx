import { useQuery } from "@apollo/client";
import { Dialog, InlineAlert, muiGridSortToGql, useDataGridRemote, usePersistentColumnState } from "@dextinity/admin";
import { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { ActionLogCompare } from "../../components/actionLogCompare/ActionLogCompare";
import { ActionLogShowVersion } from "../../components/actionLogShowVersion/ActionLogShowVersion";
import { ActionLogVersionGrid } from "../actionLogVersionGrid/ActionLogVersionGrid";
import { actionLogDialogQuery, allActionLogsDialogQuery } from "./ActionLogDialog.gql";
import type {
    GQLActionLogDialogFragment,
    GQLActionLogDialogQuery,
    GQLActionLogDialogQueryVariables,
    GQLAllActionLogsDialogQuery,
    GQLAllActionLogsDialogQueryVariables,
} from "./ActionLogDialog.gql.generated";

type ActionLogDialogView =
    | { type: "grid" }
    | { type: "showVersion"; row: GQLActionLogDialogFragment }
    | { type: "compareVersions"; before: GQLActionLogDialogFragment; after: GQLActionLogDialogFragment };

export type ActionLogDialogProps = {
    /**
     * Class name of the logged entity, for instance `"News"`.
     */
    entity: string;
    entityId: string;
    /**
     * Latest name of the entity, displayed in the dialog title.
     */
    name?: string;
    /**
     * Reads the versions of the entity in every scope the user may read, through `allActionLogs`, instead of the
     * current content scope. Requires the `actionLog` permission. Use it when the dialog is opened from the action
     * log of all entities, whose rows can belong to any scope.
     */
    showAllScopes?: boolean;
    open: boolean;
    onClose: () => void;
};

export function ActionLogDialog({ entity, entityId, name, showAllScopes, open, onClose }: ActionLogDialogProps) {
    const intl = useIntl();
    const { scope } = useContentScope();
    const [view, setView] = useState<ActionLogDialogView>({ type: "grid" });

    useEffect(() => {
        if (!open) {
            setView({ type: "grid" });
        }
    }, [open]);

    const dataGridRemote = useDataGridRemote({ initialSort: [{ field: "version", sort: "desc" }] });
    const persistentColumnState = usePersistentColumnState(`ActionLogDialog-${entity}`);

    const filter = useMemo(() => ({ entityId: { equal: entityId } }), [entityId]);
    const pagination = {
        offset: dataGridRemote.paginationModel.page * dataGridRemote.paginationModel.pageSize,
        limit: dataGridRemote.paginationModel.pageSize,
        sort: muiGridSortToGql(dataGridRemote.sortModel),
    };

    const scopedQuery = useQuery<GQLActionLogDialogQuery, GQLActionLogDialogQueryVariables>(actionLogDialogQuery, {
        variables: { entity, scope: scope as ContentScope, filter, ...pagination },
        skip: !open || showAllScopes,
    });

    const allScopesQuery = useQuery<GQLAllActionLogsDialogQuery, GQLAllActionLogsDialogQueryVariables>(allActionLogsDialogQuery, {
        variables: { filter: { ...filter, entityName: { equal: entity } }, ...pagination },
        skip: !open || !showAllScopes,
    });

    const { loading, error } = showAllScopes ? allScopesQuery : scopedQuery;
    const result = showAllScopes ? allScopesQuery.data?.allActionLogs : scopedQuery.data?.actionLogs;
    const rows = result?.nodes ?? [];

    return (
        <Dialog
            fullWidth
            maxWidth={view.type === "compareVersions" ? "xl" : "md"}
            onClose={onClose}
            open={open}
            title={intl.formatMessage({
                defaultMessage: "Action Log",
                id: "actionLog.actionLogDialog.title",
            })}
        >
            {view.type === "grid" && error && (
                <InlineAlert title={<FormattedMessage defaultMessage="Error loading action logs" id="actionLog.actionLogDialog.gridError.title" />} />
            )}

            {view.type === "grid" && !error && (
                <ActionLogVersionGrid
                    {...dataGridRemote}
                    {...persistentColumnState}
                    actionLogs={result}
                    id={entityId}
                    loading={loading}
                    name={name}
                    onShowVersionClick={(versionId) => {
                        const row = rows.find((r) => r.id === versionId);
                        if (row) {
                            setView({ type: "showVersion", row });
                        }
                    }}
                    onCompareVersionsClick={(beforeVersionId, afterVersionId) => {
                        const before = rows.find((r) => r.id === beforeVersionId);
                        const after = rows.find((r) => r.id === afterVersionId);
                        if (before && after) {
                            setView({ type: "compareVersions", before, after });
                        }
                    }}
                />
            )}

            {view.type === "showVersion" && (
                <ActionLogShowVersion
                    actionLog={view.row}
                    error={false}
                    loading={false}
                    id={entityId}
                    name={name}
                    onClickShowVersionHistory={() => setView({ type: "grid" })}
                />
            )}

            {view.type === "compareVersions" && (
                <ActionLogCompare
                    afterVersion={view.after}
                    beforeVersion={view.before}
                    error={false}
                    loading={false}
                    id={entityId}
                    name={name}
                    onClickShowVersionHistory={() => setView({ type: "grid" })}
                />
            )}
        </Dialog>
    );
}
