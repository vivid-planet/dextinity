import { gql } from "@apollo/client";

import { damFinderFileFragment } from "../../../dam/finder/damFinderItems.fragment";

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

export const damFilePickerSearchQuery = gql`
    query DamFilePickerSearch($scope: DamScopeInput!, $searchText: String!, $mimetypes: [String!], $offset: Int = 0, $limit: Int!) {
        damFilesList(
            scope: $scope
            filter: { searchText: $searchText, mimetypes: $mimetypes }
            offset: $offset
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
