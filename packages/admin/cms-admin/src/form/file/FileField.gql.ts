import { gql } from "@apollo/client";

import { damFileFieldFragment } from "./FileField.fragment";

export const damFileFieldFileQuery = gql`
    query DamFileFieldFile($id: ID!) {
        damFile(id: $id) {
            ...DamFileFieldFile
        }
    }
    ${damFileFieldFragment}
`;

export const damFileFieldFilesByIdsQuery = gql`
    query DamFileFieldFilesByIds($ids: [ID!]!, $limit: Int!, $scope: DamScopeInput!) {
        damFilesList(filter: { ids: $ids }, limit: $limit, includeArchived: true, scope: $scope) {
            nodes {
                ...DamFileFieldFile
            }
        }
    }
    ${damFileFieldFragment}
`;
