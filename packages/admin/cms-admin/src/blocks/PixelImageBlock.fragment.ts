import { gql } from "@apollo/client";

export const pixelImageBlockFragment = gql`
    fragment PixelImageBlockImage on DamFileImage {
        width
        height
        cropArea {
            focalPoint
            width
            height
            x
            y
        }
    }
`;
