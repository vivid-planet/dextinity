import { useQuery } from "@apollo/client/react";
import {
    dataGridDateTimeColumn,
    DataGridToolbar,
    GridCellContent,
    type GridColDef,
    GridFilterButton,
    MainContent,
    muiGridFilterToGql,
    muiGridSortToGql,
    ToolbarItem,
    Tooltip,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Time, View } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { type ReactNode, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { DataGrid } from "../../../dataGrid/DataGrid";
import { ActionLogTypeChip } from "../../components/actionLogTypeChip/ActionLogTypeChip";
import { useActionLogTypeValueOptions } from "../../components/actionLogTypeChip/useActionLogTypeValueOptions";
import { UserCell } from "../../components/userCell/UserCell";
import { ActionLogDialog } from "../actionLogDialog/ActionLogDialog";
import { ActionLogShowVersionDialog } from "../actionLogShowVersionDialog/ActionLogShowVersionDialog";
import { actionLogsGridQuery } from "./ActionLogsGrid.gql";
import type { GQLActionLogsGridFragment, GQLActionLogsQuery, GQLActionLogsQueryVariables } from "./ActionLogsGrid.gql.generated";

export type ActionLogsGridProps = {
    /**
     * Class name of the logged entity, for instance `"News"`.
     */
    entity: string;
    /**
     * Scope of the entity. Defaults to the current content scope. Pass it when the entity's scope differs from the
     * content scope, for instance when it has fewer dimensions.
     */
    scope?: ContentScope;
    /**
     * Returns the name shown for an entry's entity, or `undefined` to show only its ID.
     * Receives the entry's snapshot, or the previous version's snapshot when the entity was deleted.
     *
     * Defaults to the first non-empty of the fields `name`, `title`, `label`, `slug` and `description`.
     */
    getDisplayName?: (snapshot: Record<string, unknown>) => string | undefined;
    /**
     * Renders the second line of an entry's entity, for instance to name a related entity that the snapshot only holds
     * the ID of. Receives the entry's snapshot, or the previous version's snapshot when the entity was deleted.
     *
     * Defaults to the entity's ID when a display name is shown.
     */
    renderEntitySecondaryText?: (snapshot: Record<string, unknown>, entityId: string) => ReactNode;
};

const displayNameFields = ["name", "title", "label", "slug", "description"] as const;

function getDefaultDisplayName(snapshot: Record<string, unknown>): string | undefined {
    for (const field of displayNameFields) {
        const value = snapshot[field];
        if (typeof value === "string" && value.length > 0) {
            return value;
        }
    }
    return undefined;
}

function getRowSnapshot(row: GQLActionLogsGridFragment): Record<string, unknown> | undefined {
    return (row.snapshot ?? row.previousVersion?.snapshot ?? undefined) as Record<string, unknown> | undefined;
}

function getRowDisplayName(
    row: GQLActionLogsGridFragment,
    getDisplayName: (snapshot: Record<string, unknown>) => string | undefined,
): string | undefined {
    const snapshot = row.snapshot as Record<string, unknown> | null | undefined;
    const previousSnapshot = row.previousVersion?.snapshot as Record<string, unknown> | null | undefined;
    return (snapshot ? getDisplayName(snapshot) : undefined) || (previousSnapshot ? getDisplayName(previousSnapshot) : undefined) || undefined;
}

function ActionLogsGridToolbar() {
    return (
        <DataGridToolbar>
            <ToolbarItem>
                <GridFilterButton />
            </ToolbarItem>
        </DataGridToolbar>
    );
}

export function ActionLogsGrid({
    entity,
    scope: entityScope,
    getDisplayName = getDefaultDisplayName,
    renderEntitySecondaryText,
}: ActionLogsGridProps) {
    const intl = useIntl();
    const actionLogTypeValueOptions = useActionLogTypeValueOptions();
    const { scope: contentScope } = useContentScope();
    const scope = entityScope ?? contentScope;
    const [selectedRow, setSelectedRow] = useState<GQLActionLogsGridFragment | null>(null);
    const [openEntity, setOpenEntity] = useState<{ id: string; name?: string } | null>(null);

    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "createdAt", sort: "desc" }] }),
        ...usePersistentColumnState(`ActionLogsGrid-${entity}`),
    };

    const columns = useMemo<GridColDef<GQLActionLogsGridFragment>[]>(
        () => [
            {
                ...dataGridDateTimeColumn,
                field: "createdAt",
                headerName: intl.formatMessage({ id: "dextinity.actionLog.entity.columns.createdAt", defaultMessage: "Date / Time" }),
                width: 200,
            },
            {
                field: "type",
                headerName: intl.formatMessage({ id: "dextinity.actionLog.entity.columns.type", defaultMessage: "Action" }),
                type: "singleSelect",
                valueOptions: actionLogTypeValueOptions,
                sortable: false,
                width: 150,
                renderCell: ({ row }) => <ActionLogTypeChip actionLogType={row.type} />,
            },
            {
                field: "entityId",
                headerName: intl.formatMessage({ id: "dextinity.actionLog.entity.columns.entity", defaultMessage: "Entity" }),
                minWidth: 280,
                flex: 1,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => {
                    const displayName = getRowDisplayName(row, getDisplayName);
                    const snapshot = getRowSnapshot(row);
                    const secondaryText =
                        renderEntitySecondaryText && snapshot
                            ? renderEntitySecondaryText(snapshot, row.entityId)
                            : displayName
                              ? row.entityId
                              : undefined;
                    return <GridCellContent primaryText={displayName ?? row.entityId} secondaryText={secondaryText} />;
                },
            },
            {
                field: "user",
                headerName: intl.formatMessage({ id: "dextinity.actionLog.entity.columns.user", defaultMessage: "User" }),
                minWidth: 200,
                flex: 1,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => <UserCell id={row.user.id} name={row.user.name ?? undefined} />,
            },
            {
                field: "actions",
                type: "actions",
                headerName: "",
                width: 100,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => (
                    <>
                        <Tooltip title={<FormattedMessage id="dextinity.actionLog.entity.actions.showVersion" defaultMessage="Show version" />}>
                            <IconButton
                                color="primary"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedRow(row);
                                }}
                            >
                                <View />
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            title={
                                <FormattedMessage
                                    id="dextinity.actionLog.entity.actions.showEntityActionLog"
                                    defaultMessage="Show action log for this entity"
                                />
                            }
                        >
                            <IconButton
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenEntity({ id: row.entityId, name: getRowDisplayName(row, getDisplayName) });
                                }}
                            >
                                <Time />
                            </IconButton>
                        </Tooltip>
                    </>
                ),
            },
        ],
        [intl, getDisplayName, renderEntitySecondaryText, actionLogTypeValueOptions],
    );

    const { filter: gqlFilter } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLActionLogsQuery, GQLActionLogsQueryVariables>(actionLogsGridQuery, {
        variables: {
            entity,
            scope: scope as ContentScope,
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            filter: gqlFilter,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });

    const result = data?.actionLogs;
    const rowCount = useBufferedRowCount(result?.totalCount);

    if (error) {
        throw error;
    }

    return (
        <MainContent fullHeight>
            <DataGrid
                {...dataGridProps}
                columns={columns}
                rows={result?.nodes ?? []}
                rowCount={rowCount}
                loading={loading}
                disableRowSelectionOnClick
                onRowClick={({ row }) => setSelectedRow(row)}
                slots={{ toolbar: ActionLogsGridToolbar }}
                showToolbar
            />
            <ActionLogShowVersionDialog row={selectedRow} open={selectedRow !== null} onClose={() => setSelectedRow(null)} />
            {openEntity !== null && (
                <ActionLogDialog
                    entity={entity}
                    entityId={openEntity.id}
                    name={openEntity.name}
                    scope={scope}
                    open
                    onClose={() => setOpenEntity(null)}
                />
            )}
        </MainContent>
    );
}
