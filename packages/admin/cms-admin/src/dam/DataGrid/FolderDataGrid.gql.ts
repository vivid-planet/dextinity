import { gql } from "@apollo/client";

import { damFileThumbnailFragment } from "./thumbnail/DamThumbnail";

const damFileTableFragment = gql`
    fragment DamFileTable on DamFile {
        __typename
        id
        name
        fileUrl
        archived
        size
        mimetype
        contentHash
        license {
            type
            durationFrom
            durationTo
            expirationDate
            isNotValidYet
            expiresWithinThirtyDays
            hasExpired
        }
        folder {
            id
            name
            parents {
                id
                name
            }
        }
        image {
            ...DamFileThumbnail
        }
        updatedAt
        createdAt
        importSourceType
        dependents(offset: 0, limit: 1) {
            totalCount
        }
    }
    ${damFileThumbnailFragment}
`;

const damFolderTableFragment = gql`
    fragment DamFolderTable on DamFolder {
        __typename
        id
        name
        mpath
        parents {
            id
            name
        }
        numberOfFiles
        numberOfChildFolders
        isInboxFromOtherScope
        updatedAt
        createdAt
    }
`;

export const damFolderQuery = gql`
    query DamFolder($id: ID!) {
        damFolder(id: $id) {
            ...DamFolderTable
        }
    }
    ${damFolderTableFragment}
`;

export const damItemsListQuery = gql`
    query DamItemsList(
        $folderId: ID
        $includeArchived: Boolean
        $filter: DamItemFilterInput
        $sortColumnName: String
        $sortDirection: SortDirection
        $offset: Int
        $limit: Int
        $scope: DamScopeInput!
    ) {
        damItemsList(
            folderId: $folderId
            includeArchived: $includeArchived
            filter: $filter
            sortColumnName: $sortColumnName
            sortDirection: $sortDirection
            offset: $offset
            limit: $limit
            scope: $scope
        ) {
            nodes {
                ... on DamFile {
                    ...DamFileTable
                }
                ... on DamFolder {
                    ...DamFolderTable
                }
            }
            totalCount
        }
    }
    ${damFileTableFragment}
    ${damFolderTableFragment}
`;

export const moveDamFilesMutation = gql`
    mutation MoveDamFiles($fileIds: [ID!]!, $targetFolderId: ID) {
        moveDamFiles(fileIds: $fileIds, targetFolderId: $targetFolderId) {
            id
        }
    }
`;

export const moveDamFoldersMutation = gql`
    mutation MoveDamFolders($folderIds: [ID!]!, $targetFolderId: ID, $scope: DamScopeInput!) {
        moveDamFolders(folderIds: $folderIds, targetFolderId: $targetFolderId, scope: $scope) {
            id
            mpath
        }
    }
`;

export const damItemListPosition = gql`
    query DamItemListPosition(
        $id: ID!
        $type: DamItemType!
        $folderId: ID
        $includeArchived: Boolean
        $filter: DamItemFilterInput
        $sortColumnName: String
        $sortDirection: SortDirection
        $scope: DamScopeInput!
    ) {
        damItemListPosition(
            id: $id
            type: $type
            folderId: $folderId
            includeArchived: $includeArchived
            filter: $filter
            sortColumnName: $sortColumnName
            sortDirection: $sortDirection
            scope: $scope
        )
    }
`;
