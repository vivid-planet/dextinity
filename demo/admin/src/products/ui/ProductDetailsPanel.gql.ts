import { gql } from "@apollo/client";

import { productQuickEditFragment } from "./ProductQuickEditForm";

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
            status
            ...ProductsUiQuickEdit
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
    ${productQuickEditFragment}
`;
