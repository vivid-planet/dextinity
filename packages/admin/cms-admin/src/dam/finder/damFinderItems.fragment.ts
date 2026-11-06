import { gql } from "@apollo/client";

export const damFinderFileFragment = gql`
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
