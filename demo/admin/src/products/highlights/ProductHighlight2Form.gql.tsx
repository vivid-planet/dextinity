import { gql } from "@apollo/client";

import { selectProductFieldFragment } from "./SelectProductField";

export const productHighlightFormFragment = gql`
    fragment ProductHighlight2FormHandmadeDetails on ProductHighlight {
        description
        product {
            ...SelectProductField
        }
    }
    ${selectProductFieldFragment}
`;
export const productHighlightQuery = gql`
    query ProductHighlight($id: ID!) {
        productHighlight(id: $id) {
            id
            updatedAt
            ...ProductHighlight2FormHandmadeDetails
        }
    }
    ${productHighlightFormFragment}
`;
export const createProductHighlightMutation = gql`
    mutation CreateProductHighlight($input: ProductHighlightInput!) {
        createProductHighlight(input: $input) {
            id
            updatedAt
            ...ProductHighlight2FormHandmadeDetails
        }
    }
    ${productHighlightFormFragment}
`;
export const updateProductHighlightMutation = gql`
    mutation UpdateProductHighlight($id: ID!, $input: ProductHighlightUpdateInput!) {
        updateProductHighlight(id: $id, input: $input) {
            id
            updatedAt
            ...ProductHighlight2FormHandmadeDetails
        }
    }
    ${productHighlightFormFragment}
`;
