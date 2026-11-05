"use client";
import { type VideoPreviewImageProps, VimeoVideoBlock as SiteReactVimeoVideoBlock } from "@dextinity/site-react";
import type { ComponentProps } from "react";

import { VideoPreviewImage } from "./VideoPreviewImage.js";

type Props = Omit<ComponentProps<typeof SiteReactVimeoVideoBlock>, "renderPreviewImage"> &
    Partial<Pick<ComponentProps<typeof SiteReactVimeoVideoBlock>, "renderPreviewImage">>;

function renderDefaultPreviewImage(props: VideoPreviewImageProps) {
    return <VideoPreviewImage {...props} />;
}

export function VimeoVideoBlock({ renderPreviewImage = renderDefaultPreviewImage, ...props }: Props) {
    return <SiteReactVimeoVideoBlock {...props} renderPreviewImage={renderPreviewImage} />;
}
