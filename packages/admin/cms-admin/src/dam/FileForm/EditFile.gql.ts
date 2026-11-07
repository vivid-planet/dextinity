import { gql } from "@apollo/client";

const damFileDetailFragment = gql`
    fragment DamFileDetail on DamFile {
        id
        folder {
            id
        }
        name
        damPath
        size
        mimetype
        archived
        contentHash
        createdAt
        updatedAt
        title
        altText
        aiContentType
        image {
            width
            height
            cropArea {
                focalPoint
                width
                height
                x
                y
            }
            exif
        }
        license {
            type
            details
            author
            durationFrom
            durationTo
            expirationDate
            isNotValidYet
            expiresWithinThirtyDays
            hasExpired
        }
        fileUrl
    }
`;

export const damFileDetailQuery = gql`
    query DamFileDetail($id: ID!) {
        damFile(id: $id) {
            ...DamFileDetail
        }
    }
    ${damFileDetailFragment}
`;

export const updateDamFileMutation = gql`
    mutation UpdateFile($id: ID!, $input: UpdateDamFileInput!) {
        updateDamFile(id: $id, input: $input) {
            ...DamFileDetail
        }
    }
    ${damFileDetailFragment}
`;

export const damFileDependentsQuery = gql`
    query DamFileDependencies(
        $id: ID!
        $offset: Int!
        $limit: Int!
        $forceRefresh: Boolean = false
        $filter: DependentFilter
        $sort: [DependencySort!]
    ) {
        item: damFile(id: $id) {
            id
            dependents(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    rootGraphqlObjectType
                    rootId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                    scope
                }
                totalCount
            }
        }
    }
`;

export const deleteDamFileMutation = gql`
    mutation DeleteDamFile($id: ID!) {
        deleteDamFile(id: $id)
    }
`;

export const archiveDamFileMutation = gql`
    mutation ArchiveFile($id: ID!) {
        archiveDamFile(id: $id) {
            id
            archived
        }
    }
`;

export const restoreDamFileMutation = gql`
    mutation RestoreFile($id: ID!) {
        restoreDamFile(id: $id) {
            id
            archived
        }
    }
`;
