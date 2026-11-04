import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    CrudContextMenu,
    DataGridToolbar,
    FillSpace,
    type GridColDef,
    StackLink,
    useDataGridUrlState,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add as AddIcon, Edit as EditIcon } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { DataGridPro, type GridSlotsComponent } from "@mui/x-data-grid-pro";
import { FormattedMessage, useIntl } from "react-intl";

import type {
    GQLDeleteProductHighlightMutation,
    GQLDeleteProductHighlightMutationVariables,
    GQLProductHighlightsFormFragment,
    GQLProductHighlightsGridQuery,
    GQLProductHighlightsGridQueryVariables,
} from "./ProductHighlightsGrid.generated";

const productHighlightsFragment = gql`
    fragment ProductHighlightsForm on ProductHighlight {
        id
        description
    }
`;
const productHighlightsQuery = gql`
    query ProductHighlightsGrid {
        productHighlights {
            ...ProductHighlightsForm
        }
    }
    ${productHighlightsFragment}
`;
const deleteProductHighlightMutation = gql`
    mutation DeleteProductHighlight($id: ID!) {
        deleteProductHighlight(id: $id)
    }
`;
function ProductHighlightsGridToolbar() {
    return (
        <DataGridToolbar>
            <FillSpace />
            <Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                <FormattedMessage id="productHighlight.productHighlightsForm.newEntry" defaultMessage="New Product Highlight" />
            </Button>
        </DataGridToolbar>
    );
}
export function ProductHighlightsGrid() {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridUrlState(), ...usePersistentColumnState("ProductHighlightsGrid") };
    const columns: GridColDef<GQLProductHighlightsFormFragment>[] = [
        {
            field: "description",
            headerName: intl.formatMessage({ id: "productHighlight.description", defaultMessage: "Description" }),
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
                        <IconButton color="primary" component={StackLink} pageName="edit" payload={params.row.id}>
                            <EditIcon />
                        </IconButton>
                        <CrudContextMenu
                            onDelete={async () => {
                                await client.mutate<GQLDeleteProductHighlightMutation, GQLDeleteProductHighlightMutationVariables>({
                                    mutation: deleteProductHighlightMutation,
                                    variables: { id: params.row.id },
                                });
                            }}
                            refetchQueries={[productHighlightsQuery]}
                        />
                    </>
                );
            },
        },
    ];
    const { data, loading, error } = useQuery<GQLProductHighlightsGridQuery, GQLProductHighlightsGridQueryVariables>(productHighlightsQuery);
    if (error) {
        throw error;
    }
    const rows = data?.productHighlights ?? [];
    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            columns={columns}
            loading={loading}
            slots={{
                toolbar: ProductHighlightsGridToolbar as GridSlotsComponent["toolbar"],
            }}
            showToolbar
        />
    );
}
