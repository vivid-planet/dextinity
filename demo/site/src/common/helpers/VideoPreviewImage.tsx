"use client";
import { VideoPreviewImage as LibraryVideoPreviewImage, type VideoPreviewImageProps } from "@dextinity/site-react";

import { PixelImageBlock } from "../blocks/PixelImageBlock";

export function VideoPreviewImage(props: VideoPreviewImageProps) {
    return <LibraryVideoPreviewImage {...props} renderImage={(imageProps) => <PixelImageBlock {...imageProps} />} />;
}
