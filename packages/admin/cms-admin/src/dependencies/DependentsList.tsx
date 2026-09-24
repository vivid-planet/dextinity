import { type QueryResult, type TypedDocumentNode, useQuery } from "@apollo/client";
import {
    Alert,
    DataGridToolbar,
    FillSpace,
    type GqlFilter,
    GridCellContent,
    type GridColDef,
    GridFilterButton,
    messages,
    muiGridFilterToGql,
    muiGridSortToGql,
    Tooltip,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Reload, ThreeDotSaving } from "@dextinity/admin-icons";
import { Chip, IconButton } from "@mui/material";
import type { GridSlotsComponent, GridToolbarProps } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { useContentScope } from "../contentScope/Provider";
import { getContentScopeLabel } from "../contentScope/utils/getContentScopeLabel";
import { DataGrid } from "../dataGrid/DataGrid";
import type { GQLDependency } from "../graphql.generated";
import { useDependenciesConfig } from "./dependenciesConfig";
import { DependencyActions } from "./DependencyActions";
import { getDisplayNameString } from "./getDisplayNameString";

type DependencyItem = Pick<GQLDependency, "name" | "secondaryInformation" | "visible" | "rootColumnName" | "jsonPath" | "scope"> & {
    id: string;
    rootGraphqlObjectType: string;
};

type Dependent = Pick<
    GQLDependency,
    "rootGraphqlObjectType" | "rootId" | "rootColumnName" | "jsonPath" | "name" | "secondaryInformation" | "visible" | "scope"
>;

interface DependentsListQuery {
    item: {
        id: string;
        dependents: { totalCount: number; nodes: Array<Dependent> };
    };
}

type QueryVariables = {
    offset: number;
    limit: number;
    forceRefresh?: boolean;
    filter?: GqlFilter;
    sort?: Array<{ field: string; direction: "ASC" | "DESC" }>;
};

interface DependentsListGridToolbarProps extends GridToolbarProps {
    refetch: QueryResult<DependentsListQuery, QueryVariables>["refetch"];
}
function DependentsListGridToolbar({ refetch }: DependentsListGridToolbarProps) {
    const [isRefetching, setIsRefetching] = useState<boolean>(false);

    return (
        <DataGridToolbar>
            <GridFilterButton />
            <FillSpace />
            <Tooltip title={<FormattedMessage id="dextinity.dependencies.dataGrid.reloadTooltip" defaultMessage="Reload" />}>
                <IconButton
                    onClick={async () => {
                        setIsRefetching(true);
                        try {
                            await refetch({ forceRefresh: true });
                        } finally {
                            setIsRefetching(false);
                        }
                    }}
                    disabled={isRefetching}
                >
                    {isRefetching ? <ThreeDotSaving /> : <Reload />}
                </IconButton>
            </Tooltip>
        </DataGridToolbar>
    );
}

const pageSize = 10;

export interface DependentsListProps {
    query: TypedDocumentNode<DependentsListQuery, QueryVariables>;
    variables: Record<string, unknown>;
}

export const DependentsList = ({ query, variables }: DependentsListProps) => {
    const intl = useIntl();
    const { entityDependencyMap } = useDependenciesConfig();
    const contentScope = useContentScope();

    const dataGridProps = {
        ...useDataGridRemote({
            queryParamsPrefix: "dependents",
            pageSize,
            initialFilter: {
                items: [{ field: "visible", operator: "is", value: true }],
            },
        }),
        ...usePersistentColumnState("DependentsList"),
    };

    // Scopes are only worth showing when the entries can actually originate from different scopes.
    const showScopeColumn = contentScope.values.length > 1;

    const columns: GridColDef<DependencyItem>[] = useMemo(
        () => [
            {
                field: "name",
                headerName: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.nameAndInfo", defaultMessage: "Name/Info" }),
                flex: 1,
                sortBy: "name",
                renderCell: ({ row }) => (
                    <GridCellContent primaryText={row.name ?? <FormattedMessage {...messages.unknown} />} secondaryText={row.secondaryInformation} />
                ),
            },
            {
                field: "secondaryInformation",
                headerName: intl.formatMessage({
                    id: "dextinity.dependencies.dataGrid.secondaryInformation",
                    defaultMessage: "Secondary information",
                }),
                sortBy: "secondaryInformation",
                visible: false,
            },
            {
                field: "rootGraphqlObjectType",
                headerName: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.type", defaultMessage: "Type" }),
                type: "singleSelect",
                sortBy: "graphqlObjectType",
                valueOptions: Object.entries(entityDependencyMap).map(([value, dep]) => ({
                    value,
                    label: getDisplayNameString(dep.displayName, intl, value),
                })),
                renderCell: ({ row }) => <Chip label={entityDependencyMap[row.rootGraphqlObjectType]?.displayName ?? row.rootGraphqlObjectType} />,
            },
            {
                field: "visible",
                headerName: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.visible", defaultMessage: "Visible" }),
                type: "boolean",
                visible: false,
                sortBy: "visible",
            },
            ...(showScopeColumn
                ? [
                      {
                          field: "scope",
                          headerName: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.scope", defaultMessage: "Scope" }),
                          width: 160,
                          filterable: false,
                          sortable: false,
                          valueGetter: (params, row) => (row.scope ? getContentScopeLabel({ scope: row.scope, values: contentScope.values }) : null),
                      } satisfies GridColDef<DependencyItem>,
                  ]
                : []),
            {
                field: "actions",
                type: "actions",
                headerName: "",
                filterable: false,
                sortable: false,
                renderCell: ({ row }) => (
                    <DependencyActions
                        graphqlObjectType={row.rootGraphqlObjectType}
                        id={row.id}
                        rootColumnName={row.rootColumnName}
                        jsonPath={row.jsonPath}
                        scope={row.scope ?? undefined}
                    />
                ),
            },
        ],
        [intl, entityDependencyMap, showScopeColumn, contentScope.values],
    );

    const { filter: gqlFilter } = muiGridFilterToGql(columns, dataGridProps.filterModel);
    const sort = muiGridSortToGql(dataGridProps.sortModel, columns);

    const { data, loading, error, refetch } = useQuery<DependentsListQuery, QueryVariables>(query, {
        variables: {
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            filter: gqlFilter,
            sort,
            ...variables,
        },
    });

    if (error) {
        throw error;
    }

    const rowCount = useBufferedRowCount(data?.item.dependents?.totalCount);
    const rows =
        data?.item.dependents?.nodes.map((node) => {
            return {
                ...node,
                id: node.rootId,
            };
        }) ?? [];

    return (
        <>
            <DataGrid
                {...dataGridProps}
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                getRowId={(row) => {
                    return `${row.id}_${row.rootColumnName}_${row.jsonPath}`;
                }}
                slots={{
                    toolbar: DependentsListGridToolbar as GridSlotsComponent["toolbar"],
                }}
                slotProps={{
                    toolbar: { refetch } as DependentsListGridToolbarProps,
                }}
                showToolbar
            />
            <Alert
                title={<FormattedMessage id="dextinity.dependencies.dependents.info.title" defaultMessage="What are dependents?" />}
                sx={{ marginTop: 4 }}
            >
                <FormattedMessage
                    id="dextinity.dependencies.dependents.info.content"
                    defaultMessage="Dependents are all content items that reference or use this item — such as pages, snippets, or other content. Use this list to see where this item is used."
                />
            </Alert>
        </>
    );
};
