import { gql } from "@apollo/client";
import { damFileFieldFragment, finalFormFileUploadDownloadableFragment } from "@dextinity/cms-admin";

const productEditFragment = gql`
    fragment ProductsUiEdit on Product {
        id
        title
        slug
        description
        status
        type
        additionalTypes
        inStock
        availableSince
        lastCheckedAt
        price
        priceRange {
            min
            max
        }
        dimensions {
            width
            height
            depth
        }
        image
        priceList {
            ...FinalFormFileUploadDownloadable
        }
        datasheets {
            ...FinalFormFileUploadDownloadable
        }
        relatedImages {
            ...DamFileFieldFile
        }
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
            addressAsEmbeddable {
                country
            }
        }
        variants {
            id
        }
        createdAt
        updatedAt
    }
    ${finalFormFileUploadDownloadableFragment}
    ${damFileFieldFragment}
`;

export const productEditQuery = gql`
    query ProductsUiEdit($id: ID!) {
        product(id: $id) {
            ...ProductsUiEdit
        }
    }
    ${productEditFragment}
`;

export const createProductMutation = gql`
    mutation ProductsUiCreate($input: ProductInput!) {
        createProduct(input: $input) {
            product {
                ...ProductsUiEdit
            }
            errors {
                code
                field
            }
        }
    }
    ${productEditFragment}
`;

export const updateProductMutation = gql`
    mutation ProductsUiUpdate($id: ID!, $input: ProductUpdateInput!) {
        updateProduct(id: $id, input: $input) {
            ...ProductsUiEdit
        }
    }
    ${productEditFragment}
`;

export const productCategoryOptionsQuery = gql`
    query ProductsUiEditCategoryOptions($search: String) {
        productCategories(search: $search, limit: 50, sort: [{ field: position, direction: ASC }]) {
            nodes {
                id
                title
            }
        }
    }
`;

export const productTagOptionsQuery = gql`
    query ProductsUiEditTagOptions($search: String) {
        productTags(search: $search, limit: 50, sort: [{ field: title, direction: ASC }]) {
            nodes {
                id
                title
            }
        }
    }
`;

export const manufacturerCountryOptionsQuery = gql`
    query ProductsUiEditManufacturerCountryOptions($search: String) {
        manufacturerCountries(search: $search, limit: 100) {
            nodes {
                id
                label
            }
        }
    }
`;

export const manufacturerOptionsQuery = gql`
    query ProductsUiEditManufacturerOptions($search: String, $filter: ManufacturerFilter) {
        manufacturers(search: $search, filter: $filter, limit: 50, sort: [{ field: name, direction: ASC }]) {
            nodes {
                id
                name
                addressAsEmbeddable {
                    country
                }
            }
        }
    }
`;
