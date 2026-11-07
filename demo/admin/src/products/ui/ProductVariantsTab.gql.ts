import { gql } from "@apollo/client";

const productVariantRowFragment = gql`
    fragment ProductsUiVariantRow on ProductVariant {
        id
        name
        position
        image
        updatedAt
    }
`;

export const productVariantsQuery = gql`
    query ProductsUiVariants($product: ID!) {
        productVariants(product: $product, offset: 0, limit: 100, sort: [{ field: position, direction: ASC }]) {
            nodes {
                ...ProductsUiVariantRow
            }
            totalCount
        }
    }
    ${productVariantRowFragment}
`;

export const updateProductVariantPositionMutation = gql`
    mutation ProductsUiVariantPosition($id: ID!, $position: Int!) {
        updateProductVariant(id: $id, input: { position: $position }) {
            productVariant {
                id
                position
                updatedAt
            }
        }
    }
`;

export const deleteProductVariantMutation = gql`
    mutation ProductsUiVariantDelete($id: ID!) {
        deleteProductVariant(id: $id)
    }
`;
