import { gql } from "@apollo/client";

export const productCategoryFormFragment = gql`
    fragment ProductCategoryForm on ProductCategory {
        title
        slug
    }
`;
export const productCategoryQuery = gql`
    query ProductCategory($id: ID!) {
        productCategory(id: $id) {
            id
            updatedAt
            ...ProductCategoryForm
        }
    }
    ${productCategoryFormFragment}
`;
export const createProductCategoryMutation = gql`
    mutation CreateProductCategory($input: ProductCategoryInput!) {
        createProductCategory(input: $input) {
            id
            updatedAt
            ...ProductCategoryForm
        }
    }
    ${productCategoryFormFragment}
`;
export const updateProductCategoryMutation = gql`
    mutation UpdateProductCategory($id: ID!, $input: ProductCategoryUpdateInput!) {
        updateProductCategory(id: $id, input: $input) {
            id
            updatedAt
            ...ProductCategoryForm
        }
    }
    ${productCategoryFormFragment}
`;
