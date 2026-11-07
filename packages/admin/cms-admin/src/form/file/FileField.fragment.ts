import { gql } from "@apollo/client";

import { pixelImageBlockFragment } from "../../blocks/PixelImageBlock.fragment";

export const damFileFieldFragment = gql`
    fragment DamFileFieldFile on DamFile {
        id
        name
        size
        mimetype
        contentHash
        title
        altText
        archived
        folder {
            id
        }
        image {
            thumbnailUrl: url(width: 320, height: 320)
            ...PixelImageBlockImage
        }
        fileUrl
    }
    ${pixelImageBlockFragment}
`;
