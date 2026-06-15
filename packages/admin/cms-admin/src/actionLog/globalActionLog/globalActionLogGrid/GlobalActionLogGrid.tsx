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
import { Autocomplete, Chip, IconButton } from "@mui/material";
import { type GridFilterInputValueProps, type GridFilterItem, type GridFilterOperator, useGridRootProps } from "@mui/x-data-grid";
import { capitalCase } from "change-case";
import isEqual from "lodash.isequal";
import { createContext, useContext, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
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

type ScopeOption = { value: string; label: string };

const ScopeFilterOptionsContext = createContext<ScopeOption[]>([]);

function ScopeFilterSingleInput({ item, applyValue, focusElementRef, apiRef }: GridFilterInputValueProps) {
    const options = useContext(ScopeFilterOptionsContext);
    const rootProps = useGridRootProps();
    const selectedValue = typeof item.value === "string" ? (options.find((option) => option.value === item.value) ?? null) : null;
    return (
        <Autocomplete<ScopeOption, false, false, false>
            options={options}
            value={selectedValue}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, candidate) => option.value === candidate.value}
            onChange={(_, newValue) => applyValue({ ...item, value: newValue?.value ?? null })}
            renderInput={(params) => (
                <rootProps.slots.baseTextField
                    {...params}
                    label={apiRef.current.getLocaleText("filterPanelInputLabel")}
                    inputRef={focusElementRef}
                    slotProps={{
                        inputLabel: { shrink: true },
                        input: params.InputProps,
                    }}
                />
            )}
        />
    );
}

function ScopeFilterMultiInput({ item, applyValue, focusElementRef, apiRef }: GridFilterInputValueProps) {
    const options = useContext(ScopeFilterOptionsContext);
    const rootProps = useGridRootProps();
    const selectedValues = Array.isArray(item.value) ? (item.value as string[]) : [];
    const selectedOptions = options.filter((option) => selectedValues.includes(option.value));
    return (
        <Autocomplete<ScopeOption, true, false, false>
            multiple
            options={options}
            value={selectedOptions}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, candidate) => option.value === candidate.value}
            onChange={(_, newValue) => applyValue({ ...item, value: newValue.map((option) => option.value) })}
            renderInput={(params) => (
                <rootProps.slots.baseTextField
                    {...params}
                    label={apiRef.current.getLocaleText("filterPanelInputLabel")}
                    inputRef={focusElementRef}
                    slotProps={{
                        inputLabel: { shrink: true },
                        input: params.InputProps,
                    }}
                />
            )}
        />
    );
}

const throwOnLocalScopeFilter = () => {
    throw new Error("Server-side filter; not applied on the client.");
};

const scopeFilterOperators: GridFilterOperator[] = [
    { value: "is", getApplyFilterFn: throwOnLocalScopeFilter, InputComponent: ScopeFilterSingleInput },
    { value: "not", getApplyFilterFn: throwOnLocalScopeFilter, InputComponent: ScopeFilterSingleInput },
    { value: "isAnyOf", getApplyFilterFn: throwOnLocalScopeFilter, InputComponent: ScopeFilterMultiInput },
];

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

    const scopeValueOptions = useMemo(
        () => [
            { value: JSON.stringify(null), label: intl.formatMessage(messages.globalContentScope) },
            ...scopeValues.map((item) => ({
                value: JSON.stringify(item.scope),
                label: formatScopeLabel(item.scope),
            })),
        ],
        [intl, scopeValues, formatScopeLabel],
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
                filterOperators: scopeFilterOperators,
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
        [intl],
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

    const rowCount = useBufferedRowCount(data?.allActionLogs.totalCount);

    if (error) {
        throw error;
    }

    return (
        <ScopeFilterOptionsContext.Provider value={scopeValueOptions}>
            <MainContent fullHeight>
                <DataGrid
                    {...dataGridProps}
                    columns={columns}
                    rows={data?.allActionLogs.nodes ?? []}
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
        </ScopeFilterOptionsContext.Provider>
    );
}
