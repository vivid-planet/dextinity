import { type QueryResult, type TypedDocumentNode, useApolloClient, useQuery } from "@apollo/client";
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
import { ArrowRight, OpenNewTab, Reload, ThreeDotSaving } from "@dextinity/admin-icons";
import { Box, Chip, IconButton } from "@mui/material";
import type { GridSlotsComponent, GridToolbarProps } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";

import { useContentScope } from "../contentScope/Provider";
import { DataGrid } from "../dataGrid/DataGrid";
import type { GQLDependency } from "../graphql.generated";
import { useDependenciesConfig } from "./dependenciesConfig";
import { DependencyVisibilityIndicator } from "./DependencyVisibilityIndicator";
import { getDisplayNameString } from "./getDisplayNameString";
import type { DependencyInterface } from "./types";

type DependencyItem = Pick<GQLDependency, "name" | "secondaryInformation" | "visible" | "rootColumnName" | "jsonPath"> & {
    id: string;
    targetGraphqlObjectType: string;
};

type Dependency = Pick<
    GQLDependency,
    "targetGraphqlObjectType" | "targetId" | "rootColumnName" | "jsonPath" | "name" | "secondaryInformation" | "visible"
>;

interface DependenciesListQuery {
    item: {
        id: string;
        dependencies: { totalCount: number; nodes: Array<Dependency> };
    };
}

type QueryVariables = {
    offset: number;
    limit: number;
    forceRefresh?: boolean;
    filter?: GqlFilter;
    sort?: Array<{ field: string; direction: "ASC" | "DESC" }>;
};

interface DependenciesListGridToolbarProps extends GridToolbarProps {
    refetch: QueryResult<DependenciesListQuery, QueryVariables>["refetch"];
}
function DependenciesListGridToolbar({ refetch }: DependenciesListGridToolbarProps) {
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

export interface DependenciesListProps {
    query: TypedDocumentNode<DependenciesListQuery, QueryVariables>;
    variables: Record<string, unknown>;
}

export const DependenciesList = ({ query, variables }: DependenciesListProps) => {
    const intl = useIntl();
    const { entityDependencyMap } = useDependenciesConfig();
    const contentScope = useContentScope();
    const apolloClient = useApolloClient();
    const history = useHistory();

    const dataGridProps = {
        ...useDataGridRemote({
            queryParamsPrefix: "dependencies",
            pageSize,
            initialFilter: {
                items: [{ field: "visible", operator: "is", value: true }],
            },
        }),
        ...usePersistentColumnState("DependenciesList"),
    };

    const columns: GridColDef<DependencyItem>[] = useMemo(
        () => [
            {
                field: "name",
                headerName: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.nameAndInfo", defaultMessage: "Name/Info" }),
                flex: 1,
                sortBy: "name",
                renderCell: ({ row }) => (
                    <GridCellContent
                        icon={<DependencyVisibilityIndicator visible={row.visible} />}
                        primaryText={row.name ?? <FormattedMessage {...messages.unknown} />}
                        secondaryText={row.secondaryInformation}
                    />
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
                field: "targetGraphqlObjectType",
                headerName: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.type", defaultMessage: "Type" }),
                type: "singleSelect",
                sortBy: "graphqlObjectType",
                valueOptions: Object.entries(entityDependencyMap).map(([value, dep]) => ({
                    value,
                    label: getDisplayNameString(dep.displayName, intl, value),
                })),
                renderCell: ({ row }) => (
                    <Chip label={entityDependencyMap[row.targetGraphqlObjectType]?.displayName ?? row.targetGraphqlObjectType} />
                ),
            },
            {
                field: "visible",
                headerName: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.visible", defaultMessage: "Visible" }),
                type: "boolean",
                visible: false,
                sortBy: "visible",
            },
            {
                field: "actions",
                type: "actions",
                headerName: "",
                filterable: false,
                sortable: false,
                renderCell: ({ row }) => {
                    const dependencyObject = entityDependencyMap[row.targetGraphqlObjectType] as DependencyInterface | undefined;

                    if (dependencyObject === undefined) {
                        if (process.env.NODE_ENV === "development") {
                            console.warn(
                                `Cannot load URL because no implementation of DependencyInterface for ${row.targetGraphqlObjectType} was provided via the DependenciesConfig`,
                            );
                        }
                        return <FormattedMessage id="dextinity.dependencies.dataGrid.cannotLoadUrl" defaultMessage="Cannot determine URL" />;
                    }

                    const loadUrl = async () => {
                        const path = await dependencyObject.resolvePath({
                            rootColumnName: row.rootColumnName,
                            jsonPath: row.jsonPath,
                            apolloClient,
                            id: row.id,
                        });
                        return contentScope.match.url + path;
                    };

                    return (
                        <Box display="flex">
                            <IconButton
                                onClick={async () => {
                                    const url = await loadUrl();
                                    window.open(url, "_blank");
                                }}
                            >
                                <OpenNewTab />
                            </IconButton>
                            <IconButton
                                onClick={async () => {
                                    const url = await loadUrl();

                                    history.push(url);
                                }}
                            >
                                <ArrowRight />
                            </IconButton>
                        </Box>
                    );
                },
            },
        ],
        [intl, entityDependencyMap, apolloClient, contentScope, history],
    );

    const { filter: gqlFilter } = muiGridFilterToGql(columns, dataGridProps.filterModel);
    const sort = muiGridSortToGql(dataGridProps.sortModel, columns);

    const { data, loading, error, refetch } = useQuery<DependenciesListQuery, QueryVariables>(query, {
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

    const rowCount = useBufferedRowCount(data?.item.dependencies?.totalCount);
    const rows =
        data?.item.dependencies?.nodes.map((node) => {
            return {
                ...node,
                id: node.targetId,
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
                    toolbar: DependenciesListGridToolbar as GridSlotsComponent["toolbar"],
                }}
                slotProps={{
                    toolbar: { refetch } as DependenciesListGridToolbarProps,
                }}
                showToolbar
            />
            <Alert
                title={<FormattedMessage id="dextinity.dependencies.dependencies.info.title" defaultMessage="What are dependencies?" />}
                sx={{ marginTop: 4 }}
            >
                <FormattedMessage
                    id="dextinity.dependencies.dependencies.info.content"
                    defaultMessage="Dependencies are all items that this content references or uses — such as linked pages, embedded files, or other content. Use this list to review what this item depends on."
                />
            </Alert>
        </>
    );
};
