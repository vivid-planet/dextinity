import { gql } from "@apollo/client";

const productHighlightFragment = gql`
    fragment ProductHighlightsUiItem on ProductHighlight {
        id
        description
        createdAt
        updatedAt
        product {
            id
            title
            category {
                id
                title
            }
        }
    }
`;

export const productHighlightsListQuery = gql`
    query ProductHighlightsUiList {
        productHighlights {
            ...ProductHighlightsUiItem
        }
    }
    ${productHighlightFragment}
`;

export const productHighlightPanelQuery = gql`
    query ProductHighlightsUiPanel($id: ID!) {
        productHighlight(id: $id) {
            ...ProductHighlightsUiItem
        }
    }
    ${productHighlightFragment}
`;

export const productHighlightCategoryOptionsQuery = gql`
    query ProductHighlightsUiCategoryOptions($search: String) {
        productCategories(search: $search, limit: 50, sort: [{ field: position, direction: ASC }]) {
            nodes {
                id
                title
            }
        }
    }
`;

export const productHighlightProductOptionsQuery = gql`
    query ProductHighlightsUiProductOptions($search: String, $filter: ProductFilter) {
        products(search: $search, filter: $filter, limit: 50, sort: [{ field: title, direction: ASC }]) {
            nodes {
                id
                title
                category {
                    id
                    title
                }
            }
        }
    }
`;

export const createProductHighlightMutation = gql`
    mutation ProductHighlightsUiCreate($input: ProductHighlightInput!) {
        createProductHighlight(input: $input) {
            ...ProductHighlightsUiItem
        }
    }
    ${productHighlightFragment}
`;

export const updateProductHighlightMutation = gql`
    mutation ProductHighlightsUiUpdate($id: ID!, $input: ProductHighlightUpdateInput!) {
        updateProductHighlight(id: $id, input: $input) {
            ...ProductHighlightsUiItem
        }
    }
    ${productHighlightFragment}
`;

export const deleteProductHighlightMutation = gql`
    mutation ProductHighlightsUiDelete($id: ID!) {
        deleteProductHighlight(id: $id)
    }
`;
