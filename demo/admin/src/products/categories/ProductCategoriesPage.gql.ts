import { gql } from "@apollo/client";

const productCategoryFragment = gql`
    fragment ProductCategoriesUiItem on ProductCategory {
        id
        title
        slug
        position
        createdAt
        updatedAt
        type {
            id
            title
        }
        products {
            id
        }
    }
`;

export const productCategoriesListQuery = gql`
    query ProductCategoriesUiList($search: String) {
        productCategories(search: $search, offset: 0, limit: 100, sort: [{ field: position, direction: ASC }]) {
            nodes {
                ...ProductCategoriesUiItem
            }
            totalCount
        }
    }
    ${productCategoryFragment}
`;

export const productCategoryPanelQuery = gql`
    query ProductCategoriesUiPanel($id: ID!) {
        productCategory(id: $id) {
            ...ProductCategoriesUiItem
        }
    }
    ${productCategoryFragment}
`;

export const productCategoryTypesQuery = gql`
    query ProductCategoriesUiTypes {
        productCategoryTypes(offset: 0, limit: 100, sort: [{ field: title, direction: ASC }]) {
            nodes {
                id
                title
            }
        }
    }
`;

export const updateProductCategoryPositionMutation = gql`
    mutation ProductCategoriesUiUpdatePosition($id: ID!, $position: Int!) {
        updateProductCategory(id: $id, input: { position: $position }) {
            id
            position
            updatedAt
        }
    }
`;

export const createProductCategoryMutation = gql`
    mutation ProductCategoriesUiCreate($input: ProductCategoryInput!) {
        createProductCategory(input: $input) {
            ...ProductCategoriesUiItem
        }
    }
    ${productCategoryFragment}
`;

export const updateProductCategoryMutation = gql`
    mutation ProductCategoriesUiUpdate($id: ID!, $input: ProductCategoryUpdateInput!) {
        updateProductCategory(id: $id, input: $input) {
            ...ProductCategoriesUiItem
        }
    }
    ${productCategoryFragment}
`;

export const deleteProductCategoryMutation = gql`
    mutation ProductCategoriesUiDelete($id: ID!) {
        deleteProductCategory(id: $id)
    }
`;
