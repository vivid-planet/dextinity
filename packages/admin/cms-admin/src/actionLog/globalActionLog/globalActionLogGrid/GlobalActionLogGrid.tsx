import { useQuery } from "@apollo/client";
import {
    dataGridDateTimeColumn,
    DataGridToolbar,
    type GridColDef,
    MainContent,
    messages,
    muiGridSortToGql,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Box, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { capitalCase } from "change-case";
import isEqual from "lodash.isequal";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { DataGrid } from "../../../dataGrid/DataGrid";
import { ActionLogTypeChip } from "../../components/actionLogTypeChip/ActionLogTypeChip";
import { UserCell } from "../../components/userCell/UserCell";
import { GlobalActionLogShowVersionDialog } from "../globalActionLogShowVersionDialog/GlobalActionLogShowVersionDialog";
import { globalActionLogGridQuery } from "./GlobalActionLogGrid.gql";
import type {
    GQLGlobalActionLogGridFragment,
    GQLGlobalActionLogGridQuery,
    GQLGlobalActionLogGridQueryVariables,
} from "./GlobalActionLogGrid.gql.generated";

const EntityTypeChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
}));

export function GlobalActionLogGrid() {
    const intl = useIntl();
    const { values: scopeValues } = useContentScope();
    const [openVersionId, setOpenVersionId] = useState<string | null>(null);

    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "createdAt", sort: "desc" }] }),
        ...usePersistentColumnState("GlobalActionLogGrid"),
    };

    const formatScopeLabel = useMemo(
        () =>
            (scope: ContentScope): string => {
                const matched = scopeValues.find((item) => isEqual(item.scope, scope));
                const source = matched ?? { scope, label: undefined as Record<string, string> | undefined };
                return Object.keys(source.scope)
                    .map((key) => source.label?.[key] ?? capitalCase(String(source.scope[key])))
                    .join(" / ");
            },
        [scopeValues],
    );

    const columns = useMemo<GridColDef<GQLGlobalActionLogGridFragment>[]>(
        () => [
            {
                ...dataGridDateTimeColumn,
                field: "createdAt",
                headerName: intl.formatMessage({ id: "comet.globalActionLog.columns.createdAt", defaultMessage: "Date / Time" }),
                width: 200,
            },
            {
                field: "scope",
                headerName: intl.formatMessage({ id: "comet.globalActionLog.columns.scope", defaultMessage: "Scope" }),
                sortable: false,
                filterable: false,
                width: 150,
                renderCell: ({ row }) => {
                    const scopes = (row.scope as ContentScope[] | null | undefined) ?? [];
                    if (scopes.length === 0) {
                        return <Chip label={intl.formatMessage(messages.globalContentScope)} />;
                    }
                    return (
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {scopes.map((scope) => (
                                <Chip key={JSON.stringify(scope)} label={formatScopeLabel(scope)} />
                            ))}
                        </Box>
                    );
                },
            },
            {
                field: "type",
                headerName: intl.formatMessage({ id: "comet.globalActionLog.columns.type", defaultMessage: "Type" }),
                sortable: false,
                filterable: false,
                width: 150,
                renderCell: ({ value }) => <ActionLogTypeChip actionLogType={value} label={value} />,
            },
            {
                field: "entityName",
                headerName: intl.formatMessage({ id: "comet.globalActionLog.columns.entityName", defaultMessage: "Entity type" }),
                width: 150,
                renderCell: ({ value }) => <EntityTypeChip label={value} />,
            },
            {
                field: "entityId",
                headerName: intl.formatMessage({ id: "comet.globalActionLog.columns.entity", defaultMessage: "Entity" }),
                minWidth: 280,
                flex: 1,
                sortable: false,
                filterable: false,
            },
            {
                field: "user",
                headerName: intl.formatMessage({ id: "comet.globalActionLog.columns.user", defaultMessage: "User" }),
                minWidth: 200,
                flex: 1,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => <UserCell id={row.user.id} name={row.user.name ?? undefined} />,
            },
        ],
        [intl, formatScopeLabel],
    );

    const scopes = useMemo(() => scopeValues.map((item) => item.scope), [scopeValues]);

    const { data, loading, error } = useQuery<GQLGlobalActionLogGridQuery, GQLGlobalActionLogGridQueryVariables>(globalActionLogGridQuery, {
        variables: {
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            scopes,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });

    const rowCount = useBufferedRowCount(data?.actionLogs.totalCount);

    if (error) {
        throw error;
    }

    return (
        <MainContent fullHeight>
            <DataGrid
                {...dataGridProps}
                columns={columns}
                rows={data?.actionLogs.nodes ?? []}
                rowCount={rowCount}
                loading={loading}
                disableRowSelectionOnClick
                onRowClick={({ row }) => setOpenVersionId(row.id)}
                slots={{ toolbar: DataGridToolbar }}
                showToolbar
            />
            <GlobalActionLogShowVersionDialog actionLogId={openVersionId} open={openVersionId !== null} onClose={() => setOpenVersionId(null)} />
        </MainContent>
    );
}

export { globalActionLogGridFragment } from "./GlobalActionLogGrid.gql";
