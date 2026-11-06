import { gql } from "@apollo/client";

import { damFileFieldFragment } from "./FileField.fragment";

export const damFileFieldValueQuery = gql`
    query DamFileFieldValue($id: ID!) {
        damFile(id: $id) {
            ...DamFileFieldFile
        }
    }
    ${damFileFieldFragment}
`;

export const damFileFieldValuesQuery = gql`
    query DamFileFieldValues($ids: [ID!]!, $limit: Int!, $scope: DamScopeInput!) {
        damFilesList(filter: { ids: $ids }, limit: $limit, includeArchived: true, scope: $scope) {
            nodes {
                ...DamFileFieldFile
            }
        }
    }
    ${damFileFieldFragment}
`;
