import { gql } from "@apollo/client";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
    Button,
    CrudContextMenu,
    dataGridDateColumn,
    DataGridToolbar,
    FillSpace,
    type GridColDef,
    GridFilterButton,
    GridToolbarQuickFilter,
    muiGridFilterToGql,
    muiGridSortToGql,
    renderStaticSelectCell,
    StackLink,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
    useStackSwitchApi,
} from "@dextinity/admin";
import { Add as AddIcon, Edit as EditIcon } from "@dextinity/admin-icons";
import { BlockPreviewContent, DamImageBlock, useContentScope } from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import { DataGridPro, type DataGridProProps, type GridSlotsComponent } from "@mui/x-data-grid-pro";
import { useAiModeDataGridToolset } from "@src/aiMode/useAiModeDataGridToolset";
import { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { NewsContentBlock } from "./blocks/NewsContentBlock";
import type {
    GQLDeleteNewsMutation,
    GQLDeleteNewsMutationVariables,
    GQLNewsGridFragment,
    GQLNewsGridQuery,
    GQLNewsGridQueryVariables,
} from "./NewsGrid.generated";

const newsFragment = gql`
    fragment NewsGrid on News {
        id
        title
        date
        category
        image
        content
    }
`;
const newsQuery = gql`
    query NewsGrid($scope: NewsContentScopeInput!, $offset: Int!, $limit: Int!, $sort: [NewsSort!], $search: String, $filter: NewsFilter) {
        newsList(scope: $scope, offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter) {
            nodes {
                ...NewsGrid
            }
            totalCount
        }
    }
    ${newsFragment}
`;
const deleteNewsMutation = gql`
    mutation DeleteNews($id: ID!) {
        deleteNews(id: $id)
    }
`;
function NewsGridToolbar() {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <GridFilterButton />
            <FillSpace />
            <Button responsive startIcon={<AddIcon />} component={StackLink} nativeButton={false} pageName="add" payload="add">
                <FormattedMessage id="news.newsGrid.newEntry" defaultMessage="New News" />
            </Button>
        </DataGridToolbar>
    );
}
export function NewsGrid() {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("NewsGrid") };
    const { scope } = useContentScope();
    const stackSwitchApi = useStackSwitchApi();
    const handleRowClick: DataGridProProps["onRowClick"] = (params) => {
        stackSwitchApi.activatePage("edit", params.row.id);
    };
    const columns: GridColDef<GQLNewsGridFragment>[] = useMemo(
        () => [
            { field: "title", headerName: intl.formatMessage({ id: "news.title", defaultMessage: "Title" }), flex: 1, minWidth: 150 },
            {
                ...dataGridDateColumn,
                field: "date",
                headerName: intl.formatMessage({ id: "news.date", defaultMessage: "Date" }),
                flex: 1,
                minWidth: 150,
            },
            {
                field: "category",
                headerName: intl.formatMessage({ id: "news.category", defaultMessage: "Category" }),
                type: "singleSelect",
                valueFormatter: (value, row) => row.category?.toString(),
                valueOptions: [
                    {
                        value: "events",
                        label: intl.formatMessage({ id: "news.category.events", defaultMessage: "Events" }),
                    },
                    {
                        value: "company",
                        label: intl.formatMessage({ id: "news.category.company", defaultMessage: "Company" }),
                    },
                    {
                        value: "awards",
                        label: intl.formatMessage({ id: "news.category.awards", defaultMessage: "Awards" }),
                    },
                ],
                renderCell: renderStaticSelectCell,
                flex: 1,
                minWidth: 150,
            },
            {
                field: "image",
                headerName: intl.formatMessage({ id: "news.image", defaultMessage: "Image" }),
                filterable: false,
                sortable: false,
                renderCell: (params) => {
                    return <BlockPreviewContent block={DamImageBlock} input={params.row.image} />;
                },
                flex: 1,
                minWidth: 150,
            },
            {
                field: "content",
                headerName: intl.formatMessage({ id: "news.content", defaultMessage: "Content" }),
                filterable: false,
                sortable: false,
                renderCell: (params) => {
                    return <BlockPreviewContent block={NewsContentBlock} input={params.row.content} />;
                },
                flex: 1,
                minWidth: 150,
            },
            {
                field: "actions",
                headerName: "",
                sortable: false,
                filterable: false,
                type: "actions",
                align: "right",
                pinned: "right",
                width: 84,
                renderCell: (params) => {
                    return (
                        <>
                            <IconButton color="primary" component={StackLink} nativeButton={false} pageName="edit" payload={params.row.id}>
                                <EditIcon />
                            </IconButton>
                            <CrudContextMenu
                                onDelete={async () => {
                                    await client.mutate<GQLDeleteNewsMutation, GQLDeleteNewsMutationVariables>({
                                        mutation: deleteNewsMutation,
                                        variables: { id: params.row.id },
                                    });
                                }}
                                refetchQueries={[newsQuery]}
                            />
                        </>
                    );
                },
            },
        ],
        [intl, client],
    );
    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);
    const { data, loading, error } = useQuery<GQLNewsGridQuery, GQLNewsGridQueryVariables>(newsQuery, {
        variables: {
            scope,
            filter: gqlFilter,
            search: gqlSearch,
            sort: muiGridSortToGql(dataGridProps.sortModel, columns),
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
        },
        notifyOnNetworkStatusChange: false,
    });
    const rowCount = useBufferedRowCount(data?.newsList.totalCount);
    const rows = data?.newsList.nodes ?? [];
    useAiModeDataGridToolset({
        entityName: "news",
        entityLabel: "news articles",
        columns,
        dataGridProps,
        rows,
        totalCount: data?.newsList.totalCount,
        isLoading: loading,
        openForm: (id) => (id ? stackSwitchApi.activatePage("edit", id) : stackSwitchApi.activatePage("add", "add")),
    });
    if (error) {
        throw error;
    }
    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            rowCount={rowCount}
            columns={columns}
            loading={loading}
            slots={{
                toolbar: NewsGridToolbar as GridSlotsComponent["toolbar"],
            }}
            onRowClick={handleRowClick}
            showToolbar
        />
    );
}
