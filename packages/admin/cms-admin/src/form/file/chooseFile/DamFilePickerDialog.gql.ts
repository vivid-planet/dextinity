import { gql } from "@apollo/client";

export const damFilePickerFoldersQuery = gql`
    query DamFilePickerFolders($scope: DamScopeInput!) {
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

export const damFilePickerInitialFileFolderQuery = gql`
    query DamFilePickerInitialFileFolder($id: ID!) {
        damFile(id: $id) {
            id
            folder {
                id
            }
        }
    }
`;
