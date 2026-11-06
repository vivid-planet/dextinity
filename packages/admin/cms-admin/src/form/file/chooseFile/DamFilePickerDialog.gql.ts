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
