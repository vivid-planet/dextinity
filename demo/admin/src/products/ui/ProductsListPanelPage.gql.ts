import { gql } from "@apollo/client";

export const productsListQuery = gql`
    query ProductsUiList($offset: Int!, $limit: Int!, $sort: [ProductSort!], $search: String, $filter: ProductFilter, $countFilter: ProductFilter!) {
        products(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter) {
            nodes {
                id
                title
                slug
                type
                price
                inStock
                status
                updatedAt
                category {
                    id
                    title
                }
            }
            totalCount
        }
        totalProducts: products(limit: 1) {
            totalCount
        }
        allProducts: products(limit: 1, search: $search, filter: $countFilter) {
            totalCount
        }
        publishedProducts: products(limit: 1, search: $search, filter: { and: [$countFilter, { status: { equal: Published } }] }) {
            totalCount
        }
        unpublishedProducts: products(limit: 1, search: $search, filter: { and: [$countFilter, { status: { equal: Unpublished } }] }) {
            totalCount
        }
        deletedProducts: products(limit: 1, search: $search, filter: { and: [$countFilter, { status: { equal: Deleted } }] }) {
            totalCount
        }
    }
`;

export const updateProductStatusMutation = gql`
    mutation ProductsUiUpdateStatus($id: ID!, $status: ProductStatus!) {
        updateProduct(id: $id, input: { status: $status }) {
            id
            status
            updatedAt
        }
    }
`;
