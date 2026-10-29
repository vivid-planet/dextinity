import { gql } from "@apollo/client";

import { pixelImageBlockFragment } from "../../blocks/PixelImageBlock.fragment";
import { damFileThumbnailFragment } from "../../dam/DataGrid/thumbnail/DamThumbnail";

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
        image {
            ...DamFileThumbnail
            ...PixelImageBlockImage
        }
        fileUrl
    }
    ${damFileThumbnailFragment}
    ${pixelImageBlockFragment}
`;
