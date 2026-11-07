import { gql } from "@apollo/client";

const productVariantEditFragment = gql`
    fragment ProductsUiVariantEdit on ProductVariant {
        id
        name
        image
        updatedAt
        product {
            id
            title
        }
    }
`;

export const productVariantQuery = gql`
    query ProductsUiVariant($id: ID!) {
        productVariant(id: $id) {
            ...ProductsUiVariantEdit
        }
    }
    ${productVariantEditFragment}
`;

export const createProductVariantMutation = gql`
    mutation ProductsUiVariantCreate($product: ID!, $input: ProductVariantInput!) {
        createProductVariant(product: $product, input: $input) {
            productVariant {
                ...ProductsUiVariantEdit
            }
            errors {
                code
                field
            }
        }
    }
    ${productVariantEditFragment}
`;

export const updateProductVariantMutation = gql`
    mutation ProductsUiVariantUpdate($id: ID!, $input: ProductVariantUpdateInput!) {
        updateProductVariant(id: $id, input: $input) {
            productVariant {
                ...ProductsUiVariantEdit
            }
            errors {
                code
                field
            }
        }
    }
    ${productVariantEditFragment}
`;
