import { gql, useApolloClient } from "@apollo/client";
import { AsyncSelectField } from "@dextinity/admin";
import { Image } from "@dextinity/admin-icons";
import { type BlockInterface, BlocksFinalForm, createBlockSkeleton } from "@dextinity/cms-admin";
import type { ProductTeaserBlockData, ProductTeaserBlockInput } from "@src/blocks.generated";
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
    query ProductTeaserSelect {
        products {
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

        return (
            <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                <AsyncSelectField
                    name="product"
                    fullWidth
                    label={<FormattedMessage id="blocks.productTeaser.product" defaultMessage="Product" />}
                    loadOptions={async () => {
                        const { data } = await client.query<GQLProductTeaserSelectQuery, GQLProductTeaserSelectQueryVariables>({
                            query: productTeaserSelectQuery,
                        });
                        return data.products.nodes.map((node) => ({ id: node.id, title: node.title }));
                    }}
                    getOptionLabel={(option: ProductOption) => option.title}
                />
            </BlocksFinalForm>
        );
    },

    previewContent: (state) => (state.product ? [{ type: "text", content: state.product.title }] : []),

    icon: () => <Image color="primary" />,
};

export { ProductTeaserBlock };
