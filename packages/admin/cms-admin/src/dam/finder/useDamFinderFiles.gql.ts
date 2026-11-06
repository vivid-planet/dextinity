import { gql } from "@apollo/client";

import { damFinderFileFragment } from "./damFinderItems.fragment";

export const damFinderFilesQuery = gql`
    query DamFinderFiles($folderId: ID, $scope: DamScopeInput!, $offset: Int!, $limit: Int!) {
        damFilesList(folderId: $folderId, scope: $scope, offset: $offset, limit: $limit, sortColumnName: "name") {
            nodes {
                ...DamFinderFile
            }
            totalCount
        }
    }
    ${damFinderFileFragment}
`;
