import { gql } from "@apollo/client";

const damFinderFileFragment = gql`
    fragment DamFinderFile on DamFile {
        id
        name
        title
        altText
        aiContentType
        size
        mimetype
        fileUrl
        updatedAt
        image {
            width
            height
            cropArea {
                focalPoint
            }
            thumbnailUrl: url(width: 320, height: 320)
        }
    }
`;

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
