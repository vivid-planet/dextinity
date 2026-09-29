import {
    VideoPreviewImage as SiteReactVideoPreviewImage,
    type VideoPreviewImageProps as SiteReactVideoPreviewImageProps,
} from "@dextinity/site-react";

import { PixelImageBlock } from "../PixelImageBlock";

type Props = SiteReactVideoPreviewImageProps;
export function VideoPreviewImage(props: Props) {
    return <SiteReactVideoPreviewImage {...props} renderImage={(props) => <PixelImageBlock {...props} />} />;
}
