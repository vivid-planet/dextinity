import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    CrudContextMenu,
    dataGridIdColumn,
    DataGridToolbar,
    FillSpace,
    type GridColDef,
    GridFilterButton,
    GridToolbarQuickFilter,
    muiGridFilterToGql,
    muiGridSortToGql,
    StackLink,
    Tooltip,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add as AddIcon, Edit, Info } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { DataGridPro, GridColumnHeaderTitle } from "@mui/x-data-grid-pro";
import type {
    GQLDeleteManufacturerMutation,
    GQLDeleteManufacturerMutationVariables,
    GQLManufacturersListQuery,
    GQLManufacturersListQueryVariables,
} from "@src/products/ManufacturersGrid.generated";
import { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

function ManufacturersGridToolbar() {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <GridFilterButton />
            <FillSpace />
            <Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                <FormattedMessage id="manufacturers.newManufacturer" defaultMessage="New Manufacturer" />
            </Button>
        </DataGridToolbar>
    );
}

type GridValues = GQLManufacturersListQuery["manufacturers"]["nodes"][0];

export function ManufacturersGrid() {
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("ManufacturersGrid") };
    const sortModel = dataGridProps.sortModel;
    const client = useApolloClient();
    const intl = useIntl();

    const columns: GridColDef<GridValues>[] = useMemo(() => {
        return [
            {
                ...dataGridIdColumn,
                field: "id",
                width: 150,
                renderHeader: () => (
                    <>
                        <GridColumnHeaderTitle label={intl.formatMessage({ id: "manufacturers.id", defaultMessage: "ID" })} columnWidth={150} />
                        <Tooltip title={<FormattedMessage id="manufacturers.id.info" defaultMessage="The id of the manufacturer" />}>
                            <Info sx={{ marginLeft: 1 }} />
                        </Tooltip>
                    </>
                ),
            },
            {
                field: "name",
                headerName: intl.formatMessage({ id: "manufacturers.name", defaultMessage: "Name" }),
            },
            {
                field: "address.street",
                headerName: intl.formatMessage({ id: "manufacturers.street", defaultMessage: "Street" }),
                valueGetter: (params, row) => `${row.address?.street} ${row.address?.streetNumber}`,
            },
            {
                field: "address.zip",
                headerName: intl.formatMessage({ id: "manufacturers.zip", defaultMessage: "ZIP" }),
                valueGetter: (params, row) => row.address?.zip,
            },
            {
                field: "address.alternativeAddress.street",
                headerName: intl.formatMessage({ id: "manufacturers.alternativeAddressStreet", defaultMessage: "alt. Street" }),
                valueGetter: (params, row) => `${row.address?.alternativeAddress?.street} ${row.address?.alternativeAddress?.streetNumber}`,
            },
            {
                field: "address.alternativeAddress.zip",
                headerName: intl.formatMessage({ id: "manufacturers.alternativeAddressZip", defaultMessage: "alt. ZIP" }),
                valueGetter: (params, row) => row.address?.alternativeAddress?.zip,
            },
            {
                field: "addressAsEmbeddable.street",
                headerName: intl.formatMessage({ id: "manufacturers.street2", defaultMessage: "Street2" }),
                valueGetter: (params, row) => `${row.addressAsEmbeddable?.street} ${row.addressAsEmbeddable?.streetNumber}`,
            },
            {
                field: "addressAsEmbeddable.zip",
                headerName: intl.formatMessage({ id: "manufacturers.zip2", defaultMessage: "ZIP2" }),
                valueGetter: (params, row) => row.addressAsEmbeddable?.zip,
            },
            {
                field: "addressAsEmbeddable.alternativeAddress.street",
                headerName: intl.formatMessage({ id: "manufacturers.alternativeAddressStreet2", defaultMessage: "alt. Street2" }),
                valueGetter: (params, row) =>
                    `${row.addressAsEmbeddable?.alternativeAddress?.street} ${row.addressAsEmbeddable?.alternativeAddress?.streetNumber}`,
            },
            {
                field: "addressAsEmbeddable.alternativeAddress.zip",
                headerName: intl.formatMessage({ id: "manufacturers.alternativeAddressZip2", defaultMessage: "alt. ZIP2" }),
                valueGetter: (params, row) => row.addressAsEmbeddable?.alternativeAddress?.zip,
            },
            {
                field: "actions",
                type: "actions",
                headerName: "",
                sortable: false,
                filterable: false,
                pinned: "right",
                width: 84,
                renderCell: (params) => {
                    return (
                        <>
                            <IconButton color="primary" component={StackLink} pageName="edit" payload={params.row.id}>
                                <Edit />
                            </IconButton>
                            <CrudContextMenu
                                onDelete={async () => {
                                    await client.mutate<GQLDeleteManufacturerMutation, GQLDeleteManufacturerMutationVariables>({
                                        mutation: deleteManufacturerMutation,
                                        variables: { id: params.row.id },
                                    });
                                }}
                                refetchQueries={["ManufacturersList"]}
                            />
                        </>
                    );
                },
            },
        ];
    }, [client, intl]);

    const { data, loading, error } = useQuery<GQLManufacturersListQuery, GQLManufacturersListQueryVariables>(manufacturersQuery, {
        variables: {
            ...muiGridFilterToGql(columns, dataGridProps.filterModel),
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            sort: muiGridSortToGql(sortModel),
        },
    });
    if (error) {
        throw error;
    }

    const rows = data?.manufacturers.nodes ?? [];
    const rowCount = useBufferedRowCount(data?.manufacturers.totalCount);

    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            rowCount={rowCount}
            columns={columns}
            loading={loading}
            slots={{
                toolbar: ManufacturersGridToolbar,
            }}
            showToolbar
        />
    );
}

const manufacturersFragment = gql`
    fragment ManufacturersListManual on Manufacturer {
        name
        address {
            street
            streetNumber
            zip
            country
            alternativeAddress {
                street
                streetNumber
                zip
                country
            }
        }
        addressAsEmbeddable {
            street
            streetNumber
            zip
            country
            alternativeAddress {
                street
                streetNumber
                zip
                country
            }
        }
    }
`;

const manufacturersQuery = gql`
    query ManufacturersList($offset: Int!, $limit: Int!, $sort: [ManufacturerSort!], $filter: ManufacturerFilter, $search: String) {
        manufacturers(offset: $offset, limit: $limit, sort: $sort, filter: $filter, search: $search) {
            nodes {
                id
                ...ManufacturersListManual
            }
            totalCount
        }
    }
    ${manufacturersFragment}
`;

const deleteManufacturerMutation = gql`
    mutation DeleteManufacturer($id: ID!) {
        deleteManufacturer(id: $id)
    }
`;
