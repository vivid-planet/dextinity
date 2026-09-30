import { useQuery } from "@apollo/client";
import {
    dataGridDateTimeColumn,
    DataGridToolbar,
    type GridColDef,
    MainContent,
    muiGridSortToGql,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { DataGrid } from "../../../dataGrid/DataGrid";
import { ActionLogShowVersionDialog } from "../../actionLog/actionLogShowVersionDialog/ActionLogShowVersionDialog";
import type { GQLActionLogRowFragment } from "../../actionLog/actionLogsQuery.generated";
import { ActionLogTypeChip } from "../../components/actionLogTypeChip/ActionLogTypeChip";
import { ScopeCell } from "../../components/scopeCell/ScopeCell";
import { UserCell } from "../../components/userCell/UserCell";
import { globalActionLogGridQuery } from "./GlobalActionLogGrid.gql";
import type { GQLGlobalActionLogGridQuery, GQLGlobalActionLogGridQueryVariables } from "./GlobalActionLogGrid.gql.generated";
import { EntityTypeChip } from "./GlobalActionLogGrid.sc";

export function GlobalActionLogGrid() {
    const intl = useIntl();
    const [selectedRow, setSelectedRow] = useState<GQLActionLogRowFragment | null>(null);

    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "createdAt", sort: "desc" }] }),
        ...usePersistentColumnState("GlobalActionLogGrid"),
    };

    const columns = useMemo<GridColDef<GQLActionLogRowFragment>[]>(
        () => [
            {
                ...dataGridDateTimeColumn,
                field: "createdAt",
                headerName: intl.formatMessage({ id: "dextinity.globalActionLog.columns.createdAt", defaultMessage: "Date / Time" }),
                width: 200,
            },
            {
                field: "scope",
                headerName: intl.formatMessage({ id: "dextinity.globalActionLog.columns.scope", defaultMessage: "Scope" }),
                sortable: false,
                filterable: false,
                width: 150,
                renderCell: ({ row }) => <ScopeCell scopes={row.scope} />,
            },
            {
                field: "type",
                headerName: intl.formatMessage({ id: "dextinity.globalActionLog.columns.type", defaultMessage: "Type" }),
                sortable: false,
                filterable: false,
                width: 150,
                renderCell: ({ value }) => <ActionLogTypeChip actionLogType={value} label={value} />,
            },
            {
                field: "entityName",
                headerName: intl.formatMessage({ id: "dextinity.globalActionLog.columns.entityName", defaultMessage: "Entity type" }),
                width: 150,
                renderCell: ({ value }) => <EntityTypeChip label={value} />,
            },
            {
                field: "entityId",
                headerName: intl.formatMessage({ id: "dextinity.globalActionLog.columns.entity", defaultMessage: "Entity" }),
                minWidth: 280,
                flex: 1,
                sortable: false,
                filterable: false,
            },
            {
                field: "user",
                headerName: intl.formatMessage({ id: "dextinity.globalActionLog.columns.user", defaultMessage: "User" }),
                minWidth: 200,
                flex: 1,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => <UserCell id={row.user.id} name={row.user.name ?? undefined} />,
            },
        ],
        [intl],
    );

    const { data, loading, error } = useQuery<GQLGlobalActionLogGridQuery, GQLGlobalActionLogGridQueryVariables>(globalActionLogGridQuery, {
        variables: {
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });

    const rowCount = useBufferedRowCount(data?.allActionLogs.totalCount);

    if (error) {
        throw error;
    }

    return (
        <MainContent fullHeight>
            <DataGrid
                {...dataGridProps}
                columns={columns}
                rows={data?.allActionLogs.nodes ?? []}
                rowCount={rowCount}
                loading={loading}
                disableRowSelectionOnClick
                onRowClick={({ row }) => setSelectedRow(row)}
                slots={{ toolbar: DataGridToolbar }}
                showToolbar
            />
            <ActionLogShowVersionDialog row={selectedRow} open={selectedRow !== null} onClose={() => setSelectedRow(null)} />
        </MainContent>
    );
}
