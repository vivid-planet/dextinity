import { useQuery } from "@apollo/client";
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
} from "@comet/admin";
import { Time, View } from "@comet/admin-icons";
import { IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { DataGrid } from "../../../dataGrid/DataGrid";
import { ActionLogTypeChip } from "../../components/actionLogTypeChip/ActionLogTypeChip";
import { UserCell } from "../../components/userCell/UserCell";
import { ActionLogDialog } from "../actionLogDialog/ActionLogDialog";
import { ActionLogShowVersionDialog } from "../actionLogShowVersionDialog/ActionLogShowVersionDialog";
import { type ActionLogQueryName, buildActionLogsQuery } from "../actionLogsQuery";
import type { GQLActionLogRowFragment } from "../actionLogsQuery.generated";

export type ActionLogsGridProps<TQuery> = {
    /**
     * Name of the top-level entity-scoped query field, e.g. `newsActionLogs`.
     *
     * Pass your app's `GQLQuery` as the generic to constrain this to a real action log query name.
     */
    queryName: ActionLogQueryName<TQuery>;
};

const displayNameFields = ["name", "title", "label", "slug", "description"] as const;

function extractDisplayName(snapshot: Record<string, unknown> | null | undefined): string | undefined {
    if (!snapshot) {
        return undefined;
    }
    for (const field of displayNameFields) {
        const value = snapshot[field];
        if (typeof value === "string" && value.length > 0) {
            return value;
        }
    }
    return undefined;
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

type ActionLogsQueryResult = {
    [key: string]: { nodes: GQLActionLogRowFragment[]; totalCount: number };
};

export function ActionLogsGrid<TQuery = Record<string, unknown>>({ queryName }: ActionLogsGridProps<TQuery>) {
    const intl = useIntl();
    const { scope } = useContentScope();
    const [selectedRow, setSelectedRow] = useState<GQLActionLogRowFragment | null>(null);
    const [openEntityId, setOpenEntityId] = useState<string | null>(null);

    const actionLogsQuery = useMemo(() => buildActionLogsQuery(queryName), [queryName]);

    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "createdAt", sort: "desc" }] }),
        ...usePersistentColumnState(`ActionLogsGrid-${queryName}`),
    };

    const columns = useMemo<GridColDef<GQLActionLogRowFragment>[]>(
        () => [
            {
                ...dataGridDateTimeColumn,
                field: "createdAt",
                headerName: intl.formatMessage({ id: "comet.actionLog.entity.columns.createdAt", defaultMessage: "Date / Time" }),
                width: 200,
            },
            {
                field: "type",
                headerName: intl.formatMessage({ id: "comet.actionLog.entity.columns.type", defaultMessage: "Action" }),
                sortable: false,
                filterable: false,
                width: 150,
                renderCell: ({ row }) => <ActionLogTypeChip actionLogType={row.type} label={row.type} />,
            },
            {
                field: "entityId",
                headerName: intl.formatMessage({ id: "comet.actionLog.entity.columns.entity", defaultMessage: "Entity" }),
                minWidth: 280,
                flex: 1,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => {
                    const displayName =
                        extractDisplayName(row.snapshot as Record<string, unknown> | null | undefined) ??
                        extractDisplayName(row.previousVersion?.snapshot as Record<string, unknown> | null | undefined);
                    return <GridCellContent primaryText={displayName ?? row.entityId} secondaryText={displayName ? row.entityId : undefined} />;
                },
            },
            {
                field: "user",
                headerName: intl.formatMessage({ id: "comet.actionLog.entity.columns.user", defaultMessage: "User" }),
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
                        <Tooltip title={<FormattedMessage id="comet.actionLog.entity.actions.showVersion" defaultMessage="Show version" />}>
                            <IconButton color="primary" onClick={() => setSelectedRow(row)}>
                                <View />
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            title={
                                <FormattedMessage
                                    id="comet.actionLog.entity.actions.showEntityActionLog"
                                    defaultMessage="Show action log for this entity"
                                />
                            }
                        >
                            <IconButton onClick={() => setOpenEntityId(row.entityId)}>
                                <Time />
                            </IconButton>
                        </Tooltip>
                    </>
                ),
            },
        ],
        [intl],
    );

    const { filter: gqlFilter } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<ActionLogsQueryResult>(actionLogsQuery, {
        variables: {
            scope: scope as ContentScope,
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            filter: gqlFilter,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });

    const result = data?.[queryName];
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
            <ActionLogShowVersionDialog queryName={queryName} row={selectedRow} open={selectedRow !== null} onClose={() => setSelectedRow(null)} />
            {openEntityId !== null && <ActionLogDialog queryName={queryName} entityId={openEntityId} open onClose={() => setOpenEntityId(null)} />}
        </MainContent>
    );
}
