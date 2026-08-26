import { gql, useApolloClient } from "@apollo/client";
import { AsyncSelectField } from "@dextinity/admin";
import { Tag } from "@dextinity/admin-icons";
import { type BlockInterface, BlocksFinalForm, createBlockSkeleton } from "@dextinity/cms-admin";
import type { ProductPriceBlockData, ProductPriceBlockInput } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

import type {
    GQLProductPriceBlockProductQuery,
    GQLProductPriceBlockProductQueryVariables,
    GQLProductPriceSelectQuery,
    GQLProductPriceSelectQueryVariables,
} from "./ProductPriceBlock.generated";

type ProductOption = { id: string; title: string; price?: number };

type State = {
    product?: ProductOption;
};

const productPriceSelectQuery = gql`
    query ProductPriceSelect {
        products {
            nodes {
                id
                title
                price
            }
        }
    }
`;

const productPriceProductQuery = gql`
    query ProductPriceBlockProduct($id: ID!) {
        product(id: $id) {
            id
            title
            price
        }
    }
`;

const ProductPriceBlock: BlockInterface<ProductPriceBlockData, State, ProductPriceBlockInput> = {
    ...createBlockSkeleton(),

    name: "ProductPrice",

    displayName: <FormattedMessage id="blocks.productPrice.displayName" defaultMessage="Product Price" />,

    defaultValues: () => ({}),

    input2State: (input) => ({
        product: input.product ? { id: input.product.id, title: input.product.title, price: input.product.price } : undefined,
    }),

    state2Output: (state) => ({
        productId: state.product?.id,
    }),

    output2State: async (output, { apolloClient }) => {
        if (output.productId === undefined) {
            return {};
        }

        const { data } = await apolloClient.query<GQLProductPriceBlockProductQuery, GQLProductPriceBlockProductQueryVariables>({
            query: productPriceProductQuery,
            variables: { id: output.productId },
        });

        return {
            product: { id: data.product.id, title: data.product.title, price: data.product.price ?? undefined },
        };
    },

    AdminComponent: ({ state, updateState }) => {
        const client = useApolloClient();

        return (
            <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                <AsyncSelectField
                    name="product"
                    fullWidth
                    label={<FormattedMessage id="blocks.productPrice.product" defaultMessage="Product" />}
                    loadOptions={async () => {
                        const { data } = await client.query<GQLProductPriceSelectQuery, GQLProductPriceSelectQueryVariables>({
                            query: productPriceSelectQuery,
                        });
                        return data.products.nodes.map((node) => ({ id: node.id, title: node.title, price: node.price ?? undefined }));
                    }}
                    getOptionLabel={(option: ProductOption) => option.title}
                />
            </BlocksFinalForm>
        );
    },

    previewContent: (state) =>
        state.product
            ? [
                  {
                      type: "text",
                      content: state.product.price != null ? `${state.product.title} (${state.product.price} €)` : state.product.title,
                  },
              ]
            : [],

    icon: () => <Tag color="primary" />,
};

export { ProductPriceBlock };
