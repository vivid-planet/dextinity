import { gql } from "@apollo/client";

import { damFinderFileFragment } from "./damFinderItems.fragment";

export const damFinderFoldersQuery = gql`
    query DamFinderFolders($scope: DamScopeInput!) {
        damFoldersFlat(scope: $scope) {
            id
            name
            parent {
                id
            }
            numberOfFiles
            numberOfChildFolders
        }
    }
`;

export const damFinderFileUsagesQuery = gql`
    query DamFinderFileUsages($scope: DamScopeInput!, $ids: [ID!]!) {
        damFilesList(scope: $scope, filter: { ids: $ids }, limit: 100) {
            nodes {
                id
                dependents(offset: 0, limit: 1) {
                    totalCount
                }
            }
        }
    }
`;

export const deleteDamFinderFolderMutation = gql`
    mutation DeleteDamFinderFolder($id: ID!) {
        deleteDamFolder(id: $id)
    }
`;

export const archiveDamFinderFilesMutation = gql`
    mutation ArchiveDamFinderFiles($ids: [ID!]!) {
        archiveDamFiles(ids: $ids) {
            id
            archived
        }
    }
`;

export const restoreDamFinderFilesMutation = gql`
    mutation RestoreDamFinderFiles($ids: [ID!]!) {
        restoreDamFiles(ids: $ids) {
            id
            archived
        }
    }
`;

export const createDamFinderFolderMutation = gql`
    mutation CreateDamFinderFolder($input: CreateDamFolderInput!, $scope: DamScopeInput!) {
        createDamFolder(input: $input, scope: $scope) {
            id
        }
    }
`;

export const deleteDamFinderFileMutation = gql`
    mutation DeleteDamFinderFile($id: ID!) {
        deleteDamFile(id: $id)
    }
`;

export const moveDamFinderFilesMutation = gql`
    mutation MoveDamFinderFiles($fileIds: [ID!]!, $targetFolderId: ID) {
        moveDamFiles(fileIds: $fileIds, targetFolderId: $targetFolderId) {
            id
        }
    }
`;

export const moveDamFinderFoldersMutation = gql`
    mutation MoveDamFinderFolders($folderIds: [ID!]!, $targetFolderId: ID, $scope: DamScopeInput!) {
        moveDamFolders(folderIds: $folderIds, targetFolderId: $targetFolderId, scope: $scope) {
            id
        }
    }
`;

export const damFinderSearchQuery = gql`
    query DamFinderSearch($scope: DamScopeInput!, $searchText: String!, $includeArchived: Boolean!, $limit: Int!) {
        damFilesList(
            scope: $scope
            filter: { searchText: $searchText }
            includeArchived: $includeArchived
            offset: 0
            limit: $limit
            sortColumnName: "name"
        ) {
            nodes {
                ...DamFinderFile
                folder {
                    id
                }
            }
            totalCount
        }
    }
    ${damFinderFileFragment}
`;
