import { useQuery } from "@apollo/client";
import {
    dataGridDateTimeColumn,
    DataGridToolbar,
    type GridColDef,
    GridFilterButton,
    MainContent,
    messages,
    muiGridFilterToGql,
    muiGridSortToGql,
    ToolbarItem,
    Tooltip,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Time } from "@dextinity/admin-icons";
import { Chip, IconButton } from "@mui/material";
import type { GridFilterItem } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { getContentScopeLabel } from "../../../contentScope/utils/getContentScopeLabel";
import { DataGrid } from "../../../dataGrid/DataGrid";
import { ActionLogDialog } from "../../actionLog/actionLogDialog/ActionLogDialog";
import { ActionLogShowVersionDialog } from "../../actionLog/actionLogShowVersionDialog/ActionLogShowVersionDialog";
import { ActionLogTypeChip } from "../../components/actionLogTypeChip/ActionLogTypeChip";
import { ScopeCell } from "../../components/scopeCell/ScopeCell";
import { UserCell } from "../../components/userCell/UserCell";
import { globalActionLogGridQuery } from "./GlobalActionLogGrid.gql";
import type {
    GQLGlobalActionLogGridFragment,
    GQLGlobalActionLogGridQuery,
    GQLGlobalActionLogGridQueryVariables,
} from "./GlobalActionLogGrid.gql.generated";

function scopeColumnToGqlFilter(filterItem: GridFilterItem) {
    if (filterItem.operator === "isAnyOf") {
        const scopes = ((filterItem.value as string[] | undefined) ?? []).map((value) => JSON.parse(value) as ContentScope | null);
        const includesGlobal = scopes.some((scope) => scope === null);
        const contentScopes = scopes.filter((scope): scope is ContentScope => scope !== null);
        if (includesGlobal && contentScopes.length > 0) {
            return { or: [{ scope: { isGlobal: true } }, { scope: { isAnyOf: contentScopes } }] };
        }
        if (includesGlobal) {
            return { scope: { isGlobal: true } };
        }
        if (contentScopes.length === 0) {
            return { scope: {} };
        }
        return { scope: { isAnyOf: contentScopes } };
    }
    if (typeof filterItem.value !== "string") {
        return { scope: {} };
    }
    const scope = JSON.parse(filterItem.value) as ContentScope | null;
    if (scope === null) {
        return { scope: { isGlobal: filterItem.operator !== "not" } };
    }
    const gqlOperator = filterItem.operator === "not" ? "notEqual" : "equal";
    return { scope: { [gqlOperator]: scope } };
}

function GlobalActionLogGridToolbar() {
    return (
        <DataGridToolbar>
            <ToolbarItem>
                <GridFilterButton />
            </ToolbarItem>
        </DataGridToolbar>
    );
}

export function GlobalActionLogGrid() {
    const intl = useIntl();
    const { values: scopeValues } = useContentScope();
    const [selectedRow, setSelectedRow] = useState<GQLGlobalActionLogGridFragment | null>(null);
    const [openEntity, setOpenEntity] = useState<{ entityName: string; entityId: string; scope?: ContentScope } | null>(null);

    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "createdAt", sort: "desc" }] }),
        ...usePersistentColumnState("GlobalActionLogGrid"),
    };

    const scopeValueOptions = useMemo(
        () => [
            { value: JSON.stringify(null), label: intl.formatMessage(messages.globalContentScope) },
            ...scopeValues.map((item) => ({
                value: JSON.stringify(item.scope),
                label: getContentScopeLabel({ scope: item.scope, values: scopeValues }),
            })),
        ],
        [intl, scopeValues],
    );

    const columns = useMemo<GridColDef<GQLGlobalActionLogGridFragment>[]>(
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
                type: "singleSelect",
                valueOptions: scopeValueOptions,
                toGqlFilter: scopeColumnToGqlFilter,
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
                renderCell: ({ value }) => <Chip label={value} />,
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
            {
                field: "actions",
                type: "actions",
                headerName: "",
                width: 100,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => (
                    <Tooltip
                        title={
                            <FormattedMessage
                                id="dextinity.globalActionLog.actions.showEntityActionLog"
                                defaultMessage="Show action log for this entity"
                            />
                        }
                    >
                        <IconButton
                            onClick={(event) => {
                                event.stopPropagation();
                                setOpenEntity({ entityName: row.entityName, entityId: row.entityId, scope: row.scope?.[0] });
                            }}
                        >
                            <Time />
                        </IconButton>
                    </Tooltip>
                ),
            },
        ],
        [intl, scopeValueOptions],
    );

    const { filter: gqlFilter } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLGlobalActionLogGridQuery, GQLGlobalActionLogGridQueryVariables>(globalActionLogGridQuery, {
        variables: {
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            filter: gqlFilter,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });

    const rowCount = useBufferedRowCount(data?.myActionLogs.totalCount);

    if (error) {
        throw error;
    }

    return (
        <MainContent fullHeight>
            <DataGrid
                {...dataGridProps}
                columns={columns}
                rows={data?.myActionLogs.nodes ?? []}
                rowCount={rowCount}
                loading={loading}
                disableRowSelectionOnClick
                onRowClick={({ row }) => setSelectedRow(row)}
                slots={{ toolbar: GlobalActionLogGridToolbar }}
                showToolbar
            />
            <ActionLogShowVersionDialog row={selectedRow} open={selectedRow !== null} onClose={() => setSelectedRow(null)} />
            {openEntity && (
                <ActionLogDialog
                    entity={openEntity.entityName}
                    entityId={openEntity.entityId}
                    scope={openEntity.scope}
                    open
                    onClose={() => setOpenEntity(null)}
                />
            )}
        </MainContent>
    );
}
