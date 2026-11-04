import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    CrudContextMenu,
    CrudMoreActionsMenu,
    CrudVisibility,
    dataGridDateColumn,
    dataGridManyToManyColumn,
    dataGridOneToManyColumn,
    DataGridToolbar,
    type ExportApi,
    FillSpace,
    GridCellContent,
    type GridColDef,
    GridColumnsButton,
    GridFilterButton,
    GridToolbarQuickFilter,
    messages,
    muiGridFilterToGql,
    muiGridSortToGql,
    renderStaticSelectCell,
    StackLink,
    useBufferedRowCount,
    useDataGridExcelExport,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add as AddIcon, Disabled, Edit, Education as EducationIcon, Excel, Online } from "@dextinity/admin-icons";
import { CircularProgress, IconButton, useTheme } from "@mui/material";
import {
    DataGridPro,
    getGridStringOperators,
    GridFilterInputSingleSelect,
    type GridRowSelectionModel,
    type GridSlotsComponent,
} from "@mui/x-data-grid-pro";
import { ProductCategoryFilterOperators } from "@src/products/ProductCategoryFilter";
import { useMemo, useState } from "react";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";

import { PublishAllProducts } from "./helpers/PublishAllProducts";
import { ManufacturerFilterOperator } from "./ManufacturerFilter";
import type {
    GQLDeleteProductMutation,
    GQLDeleteProductMutationVariables,
    GQLProductsListManualFragment,
    GQLProductsListQuery,
    GQLProductsListQueryVariables,
    GQLUpdateProductStatusMutation,
    GQLUpdateProductStatusMutationVariables,
} from "./ProductsGrid.generated";
import { ProductsGridPreviewAction } from "./ProductsGridPreviewAction";

type ProductsGridToolbarProps = {
    exportApi: ExportApi;
    selectionModel: GridRowSelectionModel;
};

function ProductsGridToolbar({ exportApi, selectionModel }: ProductsGridToolbarProps) {
    const client = useApolloClient();
    const theme = useTheme();

    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <GridFilterButton />
            <GridColumnsButton />
            <FillSpace />
            <CrudMoreActionsMenu
                overallActions={[
                    {
                        label: <FormattedMessage {...messages.downloadAsExcel} />,
                        icon: exportApi.loading ? <CircularProgress size={20} /> : <Excel />,
                        onClick: () => exportApi.exportGrid(),
                        disabled: exportApi.loading,
                    },
                    <PublishAllProducts key="publish" />,
                ]}
                selectiveActions={[
                    {
                        label: "Publish",
                        icon: <Online htmlColor={theme.palette.success.main} />,
                        onClick: () => {
                            for (const id of Array.from(selectionModel.ids)) {
                                client.mutate<GQLUpdateProductStatusMutation, GQLUpdateProductStatusMutationVariables>({
                                    mutation: updateProductStatusMutation,
                                    variables: { id: id as string, status: "Published" },
                                    optimisticResponse: {
                                        __typename: "Mutation",
                                        updateProduct: { __typename: "Product", id: id as string, status: "Published" },
                                    },
                                });
                            }
                        },
                    },
                    {
                        label: "Unpublish",
                        icon: <Disabled />,
                        onClick: () => {
                            for (const id of Array.from(selectionModel.ids)) {
                                client.mutate<GQLUpdateProductStatusMutation, GQLUpdateProductStatusMutationVariables>({
                                    mutation: updateProductStatusMutation,
                                    variables: { id: id as string, status: "Unpublished" },
                                    optimisticResponse: {
                                        __typename: "Mutation",
                                        updateProduct: { __typename: "Product", id: id as string, status: "Unpublished" },
                                    },
                                });
                            }
                        },
                    },
                ]}
                selectionSize={selectionModel.ids.size}
            />
            <Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                <FormattedMessage id="products.newProduct" defaultMessage="New Product" />
            </Button>
        </DataGridToolbar>
    );
}

export function ProductsGrid() {
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("ProductsGrid") };
    const sortModel = dataGridProps.sortModel;
    const client = useApolloClient();
    const intl = useIntl();
    const theme = useTheme();
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
        type: "include",
        ids: new Set([]),
    });

    const columns = useMemo((): GridColDef<GQLProductsListManualFragment>[] => {
        return [
            {
                field: "overview",
                headerName: "Overview",
                minWidth: 200,
                flex: 1,
                sortBy: ["title", "price", "type", "category", "inStock"],
                visible: theme.breakpoints.down("md"),
                renderCell: ({ row }) => {
                    const secondaryValues = [
                        typeof row.price === "number" && intl.formatNumber(row.price, { style: "currency", currency: "EUR" }),
                        row.type,
                        row.category?.title,
                        row.inStock
                            ? intl.formatMessage({ id: "products.product.inStock", defaultMessage: "In stock" })
                            : intl.formatMessage({ id: "products.product.outOfStock", defaultMessage: "Out of stock" }),
                    ];
                    return <GridCellContent primaryText={row.title} secondaryText={secondaryValues.filter(Boolean).join(" • ")} />;
                },
                disableExport: true,
                filterable: false,
            },
            {
                field: "title",
                headerName: "Title",
                minWidth: 150,
                flex: 1,
                visible: theme.breakpoints.up("md"),
            },
            { field: "description", headerName: "Description", flex: 1, minWidth: 150 },
            {
                field: "price",
                headerName: "Price",
                minWidth: 100,
                flex: 1,
                type: "number",
                visible: theme.breakpoints.up("md"),
                renderCell: ({ row }) =>
                    typeof row.price === "number" ? <FormattedNumber value={row.price} style="currency" currency="EUR" /> : "-",
            },
            {
                field: "type",
                headerName: "Type",
                width: 100,
                type: "singleSelect",
                visible: theme.breakpoints.up("md"),
                valueOptions: [
                    {
                        value: "cap",
                        label: intl.formatMessage({ id: "product.type.cap.primary", defaultMessage: "Great cap" }),
                        cellContent: (
                            <GridCellContent
                                primaryText={<FormattedMessage id="product.type.cap.primary" defaultMessage="Great cap" />}
                                icon={<EducationIcon color="primary" />}
                            />
                        ),
                    },
                    {
                        value: "shirt",
                        label: intl.formatMessage({ id: "product.type.shirt", defaultMessage: "Shirt" }),
                    },
                    {
                        value: "tie",
                        label: intl.formatMessage({ id: "product.type.tie", defaultMessage: "Tie" }),
                    },
                ],
                renderCell: renderStaticSelectCell,
            },
            {
                type: "singleSelect",
                field: "additionalTypes",
                headerName: "Additional Types",
                width: 150,
                renderCell: (params) => <>{params.row.additionalTypes.join(", ")}</>,
                filterOperators: [
                    {
                        value: "contains",
                        getApplyFilterFn: (filterItem) => {
                            throw new Error("not implemented, we filter server side");
                        },
                        InputComponent: GridFilterInputSingleSelect,
                    },
                ],
                valueOptions: ["cap", "shirt", "tie"],
                disableExport: true,
            },
            {
                field: "titleSlugOrDescription",
                headerName: "Title, Slug or Description",
                width: 150,
                visible: theme.breakpoints.down(0), // always hidden but used for filtering
                disableExport: true,
                filterOperators: getGridStringOperators().filter((operator) => operator.value === "contains"),
                toGqlFilter: (filterItem) => {
                    return {
                        or: [
                            { title: { contains: filterItem.value } },
                            { slug: { contains: filterItem.value } },
                            { description: { contains: filterItem.value } },
                        ],
                    };
                },
            },
            {
                field: "category",
                headerName: "Category",
                flex: 1,
                minWidth: 100,
                renderCell: (params) => <>{params.row.category?.title}</>,
                filterOperators: ProductCategoryFilterOperators,
                visible: theme.breakpoints.up("md"),
                disableExport: true,
            },
            {
                ...dataGridManyToManyColumn,
                field: "tags",
                headerName: "Tags",
                flex: 1,
                minWidth: 150,
                renderCell: (params) => <>{params.row.tags.map((tag) => tag.title).join(", ")}</>,
                disableExport: true,
            },
            {
                ...dataGridOneToManyColumn,
                field: "variants",
                headerName: "Variants",
                flex: 1,
                minWidth: 150,
                renderCell: (params) => <>{params.row.variants.map((variant) => variant.name).join(", ")}</>,
                disableExport: true,
            },
            {
                field: "inStock",
                headerName: intl.formatMessage({ id: "product.inStock", defaultMessage: "In stock" }),
                type: "boolean",
                flex: 1,
                minWidth: 80,
                disableExport: true,
            },
            {
                ...dataGridDateColumn,
                field: "availableSince",
                headerName: "Available Since",
                width: 130,
            },
            {
                field: "status",
                headerName: "Status",
                flex: 1,
                minWidth: 130,
                type: "boolean",
                valueGetter: (params, row) => row.status == "Published",
                renderCell: (params) => {
                    return (
                        <CrudVisibility
                            visibility={params.row.status == "Published"}
                            onUpdateVisibility={async (status) => {
                                await client.mutate<GQLUpdateProductStatusMutation, GQLUpdateProductStatusMutationVariables>({
                                    mutation: updateProductStatusMutation,
                                    variables: { id: params.row.id, status: status ? "Published" : "Unpublished" },
                                    optimisticResponse: {
                                        __typename: "Mutation",
                                        updateProduct: { __typename: "Product", id: params.row.id, status: status ? "Published" : "Unpublished" },
                                    },
                                });
                            }}
                        />
                    );
                },
                disableExport: true,
            },
            {
                field: "manufacturer",
                headerName: intl.formatMessage({ id: "products.manufacturer", defaultMessage: "Manufacturer" }),
                sortable: false,
                valueGetter: (params, row) => row.manufacturer?.name,
                filterOperators: [ManufacturerFilterOperator],
                disableExport: true,
            },
            {
                field: "actions",
                type: "actions",
                headerName: "",
                sortable: false,
                filterable: false,
                width: 116,
                pinned: "right",
                renderCell: (params) => {
                    return (
                        <>
                            <ProductsGridPreviewAction {...params} />
                            <IconButton color="primary" component={StackLink} pageName="edit" payload={params.row.id}>
                                <Edit />
                            </IconButton>
                            <CrudContextMenu
                                onDelete={async () => {
                                    await client.mutate<GQLDeleteProductMutation, GQLDeleteProductMutationVariables>({
                                        mutation: deleteProductMutation,
                                        variables: { id: params.row.id },
                                    });
                                }}
                                refetchQueries={["ProductsList"]}
                            />
                        </>
                    );
                },
                disableExport: true,
            },
        ];
    }, [client, intl, theme]);

    const { data, loading, error } = useQuery<GQLProductsListQuery, GQLProductsListQueryVariables>(productsQuery, {
        variables: {
            ...muiGridFilterToGql(columns, dataGridProps.filterModel),
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            sort: muiGridSortToGql(sortModel, columns),
        },
    });
    if (error) {
        throw error;
    }
    const rows = data?.products.nodes ?? [];
    const rowCount = useBufferedRowCount(data?.products.totalCount);

    const exportApi = useDataGridExcelExport<
        GQLProductsListQuery["products"]["nodes"][0],
        GQLProductsListQuery,
        Omit<GQLProductsListQueryVariables, "offset" | "limit">
    >({
        columns,
        variables: {
            ...muiGridFilterToGql(columns, dataGridProps.filterModel),
        },
        query: productsQuery,
        resolveQueryNodes: (data) => data.products.nodes,
        totalCount: data?.products.totalCount ?? 0,
        exportOptions: {
            fileName: "Products",
        },
    });

    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            rowCount={rowCount}
            columns={columns}
            loading={loading}
            slots={{
                toolbar: ProductsGridToolbar as GridSlotsComponent["toolbar"],
            }}
            slotProps={{
                toolbar: { exportApi, selectionModel } as ProductsGridToolbarProps,
            }}
            checkboxSelection
            keepNonExistentRowsSelected
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={(selectionModel) => {
                setSelectionModel(selectionModel);
            }}
            disableRowSelectionExcludeModel
            showToolbar
        />
    );
}

const productsFragment = gql`
    fragment ProductsListManual on Product {
        id
        slug
        title
        description
        price
        type
        additionalTypes
        inStock
        image
        status
        category {
            id
            title
        }
        tags {
            id
            title
        }
        colors {
            name
            hexCode
        }
        variants {
            id
            name
        }
        manufacturer {
            name
        }
        articleNumbers
        discounts {
            quantity
            price
        }
        availableSince
    }
`;

const productsQuery = gql`
    query ProductsList($offset: Int, $limit: Int, $sort: [ProductSort!], $filter: ProductFilter, $search: String) {
        products(offset: $offset, limit: $limit, sort: $sort, filter: $filter, search: $search) {
            nodes {
                id
                ...ProductsListManual
            }
            totalCount
        }
    }
    ${productsFragment}
`;

const deleteProductMutation = gql`
    mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
    }
`;

const updateProductStatusMutation = gql`
    mutation UpdateProductStatus($id: ID!, $status: ProductStatus!) {
        updateProduct(id: $id, input: { status: $status }) {
            id
            status
        }
    }
`;
