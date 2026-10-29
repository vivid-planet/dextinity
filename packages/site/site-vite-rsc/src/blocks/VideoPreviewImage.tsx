import { VideoPreviewImage as SiteReactVideoPreviewImage, type VideoPreviewImageProps } from "@dextinity/site-react";

import { PixelImageBlock } from "./PixelImageBlock.js";

export function VideoPreviewImage(props: VideoPreviewImageProps) {
    return <SiteReactVideoPreviewImage {...props} renderImage={(imageProps) => <PixelImageBlock {...imageProps} />} />;
}
