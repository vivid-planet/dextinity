import { gql, useApolloClient } from "@apollo/client";
import { type BlockInterface, BlocksFinalForm, createBlockSkeleton } from "@dextinity/cms-admin";
import { Icon } from "@dextinity/ui";
import { ComboboxField } from "@dextinity/ui-react-final-form";
import type { ProductTeaserBlockData, ProductTeaserBlockInput } from "@src/blocks.generated";
import { useComboboxLabels } from "@src/common/useComboboxLabels";
import { FormattedMessage } from "react-intl";

import type {
    GQLProductTeaserBlockProductQuery,
    GQLProductTeaserBlockProductQueryVariables,
    GQLProductTeaserSelectQuery,
    GQLProductTeaserSelectQueryVariables,
} from "./ProductTeaserBlock.generated";

type ProductOption = { id: string; title: string };

type State = {
    product?: ProductOption;
};

const productTeaserSelectQuery = gql`
    query ProductTeaserSelect($search: String) {
        products(search: $search) {
            nodes {
                id
                title
            }
        }
    }
`;

const productTeaserProductQuery = gql`
    query ProductTeaserBlockProduct($id: ID!) {
        product(id: $id) {
            id
            title
        }
    }
`;

const ProductTeaserBlock: BlockInterface<ProductTeaserBlockData, State, ProductTeaserBlockInput> = {
    ...createBlockSkeleton(),

    name: "ProductTeaser",

    displayName: <FormattedMessage id="blocks.productTeaser.displayName" defaultMessage="Product Teaser" />,

    defaultValues: () => ({}),

    state2Output: (state) => ({
        productId: state.product?.id,
    }),

    output2State: async (output, { apolloClient }) => {
        if (output.productId === undefined) {
            return {};
        }

        const { data } = await apolloClient.query<GQLProductTeaserBlockProductQuery, GQLProductTeaserBlockProductQueryVariables>({
            query: productTeaserProductQuery,
            variables: { id: output.productId },
        });

        return {
            product: { id: data.product.id, title: data.product.title },
        };
    },

    AdminComponent: ({ state, updateState }) => {
        const client = useApolloClient();
        const comboboxLabels = useComboboxLabels();

        return (
            <BlocksFinalForm<State> onSubmit={updateState} initialValues={state}>
                <ComboboxField<ProductOption, false, ProductOption | undefined>
                    name="product"
                    label={<FormattedMessage id="blocks.productTeaser.product" defaultMessage="Product" />}
                    loadOptions={async (search, { signal }) => {
                        const { data } = await client.query<GQLProductTeaserSelectQuery, GQLProductTeaserSelectQueryVariables>({
                            query: productTeaserSelectQuery,
                            variables: { search: search || undefined },
                            context: { fetchOptions: { signal } },
                        });
                        return data.products.nodes.map((node) => ({ id: node.id, title: node.title }));
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

    previewContent: (state) => (state.product ? [{ type: "text", content: state.product.title }] : []),

    icon: () => <Icon name="image" />,
};

export { ProductTeaserBlock };
