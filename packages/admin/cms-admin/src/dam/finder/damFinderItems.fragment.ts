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
        archived
        importSourceType
        license {
            type
            durationTo
            expirationDate
            isNotValidYet
            expiresWithinThirtyDays
            hasExpired
        }
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
