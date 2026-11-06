import { gql, useApolloClient } from "@apollo/client";
import { type BlockInterface, BlocksFinalForm, createBlockSkeleton } from "@dextinity/cms-admin";
import { Icon } from "@dextinity/ui";
import { ComboboxField } from "@dextinity/ui-react-final-form";
import type { ProductPriceBlockData, ProductPriceBlockInput } from "@src/blocks.generated";
import { useComboboxLabels } from "@src/common/useComboboxLabels";
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
    query ProductPriceSelect($search: String) {
        products(search: $search) {
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
        const comboboxLabels = useComboboxLabels();

        return (
            <BlocksFinalForm<State> onSubmit={updateState} initialValues={state}>
                <ComboboxField<ProductOption, false, ProductOption | undefined>
                    name="product"
                    label={<FormattedMessage id="blocks.productPrice.product" defaultMessage="Product" />}
                    loadOptions={async (search, { signal }) => {
                        const { data } = await client.query<GQLProductPriceSelectQuery, GQLProductPriceSelectQueryVariables>({
                            query: productPriceSelectQuery,
                            variables: { search: search || undefined },
                            context: { fetchOptions: { signal } },
                        });
                        return data.products.nodes.map((node) => ({ id: node.id, title: node.title, price: node.price ?? undefined }));
                    }}
                    getOptionLabel={(option) => option.title}
                    format={(product) => product ?? null}
                    parse={(product) => product ?? undefined}
                    isEqual={(productA, productB) => productA?.id === productB?.id}
                    labels={comboboxLabels}
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

    icon: () => <Icon name="tag" />,
};

export { ProductPriceBlock };
