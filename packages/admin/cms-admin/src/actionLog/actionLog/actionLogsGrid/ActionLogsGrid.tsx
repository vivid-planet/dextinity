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
import { actionLogsGridQuery } from "./ActionLogsGrid.gql";
import type { GQLActionLogsGridFragment, GQLActionLogsQuery, GQLActionLogsQueryVariables } from "./ActionLogsGrid.gql.generated";

export type ActionLogsGridProps = {
    /**
     * Class name of the logged entity, for instance `"News"`.
     */
    entity: string;
    /**
     * Returns the name shown for an entry's entity, or `undefined` to show only its ID.
     * Receives the entry's snapshot, or the previous version's snapshot when the entity was deleted.
     *
     * Defaults to the first non-empty of the fields `name`, `title`, `label`, `slug` and `description`.
     */
    getDisplayName?: (snapshot: Record<string, unknown>) => string | undefined;
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

function ActionLogsGridToolbar() {
    return (
        <DataGridToolbar>
            <ToolbarItem>
                <GridFilterButton />
            </ToolbarItem>
        </DataGridToolbar>
    );
}

export function ActionLogsGrid({ entity, getDisplayName = getDefaultDisplayName }: ActionLogsGridProps) {
    const intl = useIntl();
    const { scope } = useContentScope();
    const [selectedRow, setSelectedRow] = useState<GQLActionLogsGridFragment | null>(null);
    const [openEntityId, setOpenEntityId] = useState<string | null>(null);

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
                    const snapshot = row.snapshot as Record<string, unknown> | null | undefined;
                    const previousSnapshot = row.previousVersion?.snapshot as Record<string, unknown> | null | undefined;
                    const displayName =
                        (snapshot ? getDisplayName(snapshot) : undefined) ?? (previousSnapshot ? getDisplayName(previousSnapshot) : undefined);
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
                                    setOpenEntityId(row.entityId);
                                }}
                            >
                                <Time />
                            </IconButton>
                        </Tooltip>
                    </>
                ),
            },
        ],
        [intl, getDisplayName],
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
            {openEntityId !== null && <ActionLogDialog entity={entity} entityId={openEntityId} open onClose={() => setOpenEntityId(null)} />}
        </MainContent>
    );
}
