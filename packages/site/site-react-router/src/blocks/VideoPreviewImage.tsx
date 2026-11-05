"use client";
import {
    VideoPreviewImage as SiteReactVideoPreviewImage,
    type VideoPreviewImageProps as SiteReactVideoPreviewImageProps,
} from "@dextinity/site-react";

import { PixelImageBlock } from "./PixelImageBlock";

export function VideoPreviewImage(props: SiteReactVideoPreviewImageProps) {
    return <SiteReactVideoPreviewImage {...props} renderImage={(props) => <PixelImageBlock {...props} />} />;
}
