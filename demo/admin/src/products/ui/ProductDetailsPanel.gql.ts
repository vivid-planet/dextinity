import { gql } from "@apollo/client";

export const productDetailsQuery = gql`
    query ProductsUiDetails($id: ID!) {
        product(id: $id) {
            id
            title
            slug
            description
            type
            additionalTypes
            price
            inStock
            status
            image
            availableSince
            soldCount
            articleNumbers
            createdAt
            updatedAt
            category {
                id
                title
            }
            tags {
                id
                title
            }
            manufacturer {
                id
                name
            }
            variants {
                id
            }
            statistics {
                id
                views
            }
        }
    }
`;

export const updateProductInStockMutation = gql`
    mutation ProductsUiUpdateInStock($id: ID!, $inStock: Boolean!) {
        updateProduct(id: $id, input: { inStock: $inStock }) {
            id
            inStock
            updatedAt
        }
    }
`;
