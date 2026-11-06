import { gql } from "@apollo/client";

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
