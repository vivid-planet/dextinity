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
} from "@dextinity/admin";
import { Time, View } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { DataGrid } from "../../../dataGrid/DataGrid";
import { ActionLogTypeChip } from "../../components/actionLogTypeChip/ActionLogTypeChip";
import { UserCell } from "../../components/userCell/UserCell";
import { ActionLogDialog } from "../actionLogDialog/ActionLogDialog";
import { ActionLogShowVersionDialog } from "../actionLogShowVersionDialog/ActionLogShowVersionDialog";
import { actionLogsQuery } from "../actionLogsQuery";
import type { GQLActionLogRowFragment, GQLActionLogsQuery, GQLActionLogsQueryVariables } from "../actionLogsQuery.generated";

export type ActionLogsGridProps = {
    /**
     * Class name of the logged entity, for instance `"News"`.
     */
    entity: string;
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

export function ActionLogsGrid({ entity }: ActionLogsGridProps) {
    const intl = useIntl();
    const { scope } = useContentScope();
    const [selectedRow, setSelectedRow] = useState<GQLActionLogRowFragment | null>(null);
    const [openEntityId, setOpenEntityId] = useState<string | null>(null);

    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "createdAt", sort: "desc" }] }),
        ...usePersistentColumnState(`ActionLogsGrid-${entity}`),
    };

    const columns = useMemo<GridColDef<GQLActionLogRowFragment>[]>(
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
                sortable: false,
                filterable: false,
                width: 150,
                renderCell: ({ row }) => <ActionLogTypeChip actionLogType={row.type} label={row.type} />,
            },
            {
                field: "entityId",
                headerName: intl.formatMessage({ id: "dextinity.actionLog.entity.columns.entity", defaultMessage: "Entity" }),
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
                            <IconButton color="primary" onClick={() => setSelectedRow(row)}>
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

    const { data, loading, error } = useQuery<GQLActionLogsQuery, GQLActionLogsQueryVariables>(actionLogsQuery, {
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
            <ActionLogShowVersionDialog entity={entity} row={selectedRow} open={selectedRow !== null} onClose={() => setSelectedRow(null)} />
            {openEntityId !== null && <ActionLogDialog entity={entity} entityId={openEntityId} open onClose={() => setOpenEntityId(null)} />}
        </MainContent>
    );
}
