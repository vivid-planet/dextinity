import { useQuery } from "@apollo/client";
import { Dialog, InlineAlert, muiGridSortToGql, useDataGridRemote, usePersistentColumnState } from "@dextinity/admin";
import { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { ActionLogCompare } from "../../components/actionLogCompare/ActionLogCompare";
import { ActionLogShowVersion } from "../../components/actionLogShowVersion/ActionLogShowVersion";
import { ActionLogVersionGrid } from "../actionLogVersionGrid/ActionLogVersionGrid";
import { actionLogDialogQuery } from "./ActionLogDialog.gql";
import type { GQLActionLogDialogFragment, GQLActionLogDialogQuery, GQLActionLogDialogQueryVariables } from "./ActionLogDialog.gql.generated";

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
     * Scope to read the action log in. Defaults to the current content scope; pass the scope of an action log row
     * when the dialog is opened from a list of several scopes.
     */
    scope?: ContentScope;
    open: boolean;
    onClose: () => void;
};

export function ActionLogDialog({ entity, entityId, name, scope: requestedScope, open, onClose }: ActionLogDialogProps) {
    const intl = useIntl();
    const { scope: currentScope } = useContentScope();
    const scope = requestedScope ?? currentScope;
    const [view, setView] = useState<ActionLogDialogView>({ type: "grid" });

    useEffect(() => {
        if (!open) {
            setView({ type: "grid" });
        }
    }, [open]);

    const dataGridRemote = useDataGridRemote({ initialSort: [{ field: "version", sort: "desc" }] });
    const persistentColumnState = usePersistentColumnState(`ActionLogDialog-${entity}`);

    const filter = useMemo(() => ({ entityId: { equal: entityId } }), [entityId]);

    const { data, loading, error } = useQuery<GQLActionLogDialogQuery, GQLActionLogDialogQueryVariables>(actionLogDialogQuery, {
        variables: {
            entity,
            scope: scope as ContentScope,
            offset: dataGridRemote.paginationModel.page * dataGridRemote.paginationModel.pageSize,
            limit: dataGridRemote.paginationModel.pageSize,
            filter,
            sort: muiGridSortToGql(dataGridRemote.sortModel),
        },
        skip: !open,
    });

    const result = data?.actionLogs;
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
