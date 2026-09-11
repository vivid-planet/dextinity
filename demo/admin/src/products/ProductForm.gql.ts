import { gql } from "@apollo/client";
import { damFileFieldFragment, finalFormFileUploadFragment } from "@dextinity/cms-admin";

export const productFormFragment = gql`
    fragment ProductFormManual on Product {
        title
        slug
        description
        type
        additionalTypes
        inStock
        image
        priceList {
            ...FinalFormFileUpload
        }
        datasheets {
            ...FinalFormFileUpload
        }
        relatedImages {
            ...DamFileFieldFile
        }
        manufacturer {
            id
            name
            addressAsEmbeddable {
                country
            }
        }
        category {
            id
            title
        }
        tags {
            id
            title
        }
        priceRange {
            min
            max
        }
        lastCheckedAt
        dimensions {
            width
            height
            depth
        }
        availableSince
    }
    ${finalFormFileUploadFragment}
    ${damFileFieldFragment}
`;

export const productQuery = gql`
    query Product($id: ID!) {
        product(id: $id) {
            id
            updatedAt
            ...ProductFormManual
        }
    }
    ${productFormFragment}
`;

export const createProductMutation = gql`
    mutation CreateProduct($input: ProductInput!) {
        createProduct(input: $input) {
            product {
                id
                updatedAt
                ...ProductFormManual
            }
            errors {
                code
                field
            }
        }
    }
    ${productFormFragment}
`;

export const updateProductMutation = gql`
    mutation UpdateProduct($id: ID!, $input: ProductUpdateInput!) {
        updateProduct(id: $id, input: $input) {
            id
            updatedAt
            ...ProductFormManual
        }
    }
    ${productFormFragment}
`;
