import { gql } from "@apollo/client";

const productTagsListFragment = gql`
    fragment ProductTagsUiListItem on ProductTag {
        id
        title
        createdAt
        updatedAt
        products {
            id
        }
    }
`;

export const productTagsListQuery = gql`
    query ProductTagsUiList($offset: Int!, $limit: Int!, $sort: [ProductTagSort!], $search: String) {
        productTags(offset: $offset, limit: $limit, sort: $sort, search: $search) {
            nodes {
                ...ProductTagsUiListItem
            }
            totalCount
        }
    }
    ${productTagsListFragment}
`;

export const productTagPanelQuery = gql`
    query ProductTagsUiPanel($id: ID!) {
        productTag(id: $id) {
            ...ProductTagsUiListItem
        }
    }
    ${productTagsListFragment}
`;

export const createProductTagMutation = gql`
    mutation ProductTagsUiCreate($input: ProductTagInput!) {
        createProductTag(input: $input) {
            ...ProductTagsUiListItem
        }
    }
    ${productTagsListFragment}
`;

export const updateProductTagMutation = gql`
    mutation ProductTagsUiUpdate($id: ID!, $input: ProductTagUpdateInput!) {
        updateProductTag(id: $id, input: $input) {
            ...ProductTagsUiListItem
        }
    }
    ${productTagsListFragment}
`;

export const deleteProductTagMutation = gql`
    mutation ProductTagsUiDelete($id: ID!) {
        deleteProductTag(id: $id)
    }
`;
