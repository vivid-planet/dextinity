import { gql } from "@apollo/client";

export const productQuickEditFragment = gql`
    fragment ProductsUiQuickEdit on Product {
        id
        title
        slug
        description
        price
        inStock
        status
    }
`;

export const updateProductQuickEditMutation = gql`
    mutation ProductsUiQuickEdit($id: ID!, $input: ProductUpdateInput!) {
        updateProduct(id: $id, input: $input) {
            ...ProductsUiQuickEdit
            updatedAt
        }
    }
    ${productQuickEditFragment}
`;

export const productsWithSlugQuery = gql`
    query ProductsUiQuickEditProductsWithSlug($slug: String!) {
        products(filter: { slug: { equal: $slug } }, limit: 1) {
            nodes {
                id
            }
        }
    }
`;
