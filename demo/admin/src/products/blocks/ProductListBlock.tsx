import { gql, useQuery } from "@apollo/client";
import { useBufferedRowCount, useDataGridRemote, usePersistentColumnState } from "@dextinity/admin";
import { type BlockInterface, createBlockSkeleton } from "@dextinity/cms-admin";
import { Box } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { ProductListBlockData, ProductListBlockInput } from "@src/blocks.generated";
import { FormattedMessage, useIntl } from "react-intl";

import type { GQLProductListBlockQuery, GQLProductListBlockQueryVariables } from "./ProductListBlock.generated";

type State = {
    ids: string[];
};

export const ProductListBlock: BlockInterface<ProductListBlockData, State, ProductListBlockInput> = {
    ...createBlockSkeleton(),
    name: "ProductList",
    displayName: <FormattedMessage id="blocks.productList.name" defaultMessage="Product List" />,
    defaultValues: () => ({ ids: [] }),
    AdminComponent: ({ state, updateState }) => {
        const dataGridProps = {
            ...useDataGridRemote(),
            ...usePersistentColumnState("ProductListBlock"),
        };
        const intl = useIntl();

        const { data, loading, error } = useQuery<GQLProductListBlockQuery, GQLProductListBlockQueryVariables>(gql`
            query ProductListBlock {
                products {
                    nodes {
                        id
                        ...ProductListBlockProduct
                    }
                    totalCount
                }
            }
            fragment ProductListBlockProduct on Product {
                title
            }
        `);
        const rowCount = useBufferedRowCount(data?.products.totalCount);

        if (error) {
            throw error;
        }

        const rows = data?.products.nodes ?? [];

        return (
            <Box sx={{ height: 500 }}>
                <DataGridPro
                    {...dataGridProps}
                    rows={rows}
                    rowCount={rowCount}
                    columns={[
                        {
                            field: "title",
                            headerName: intl.formatMessage({ id: "product.title", defaultMessage: "Title" }),
                            width: 150,
                        },
                    ]}
                    loading={loading}
                    checkboxSelection
                    keepNonExistentRowsSelected
                    rowSelectionModel={{ type: "include", ids: new Set(state.ids) }}
                    onRowSelectionModelChange={(newSelection) => {
                        updateState({ ids: Array.from(newSelection.ids) as string[] });
                    }}
                    disableRowSelectionExcludeModel
                />
            </Box>
        );
    },
};
