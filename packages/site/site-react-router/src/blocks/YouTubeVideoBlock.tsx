"use client";
import { type VideoPreviewImageProps, YouTubeVideoBlock as SiteReactYouTubeVideoBlock } from "@dextinity/site-react";
import type { ComponentProps } from "react";

import { VideoPreviewImage } from "./VideoPreviewImage";

type Props = Omit<ComponentProps<typeof SiteReactYouTubeVideoBlock>, "renderPreviewImage"> &
    Partial<Pick<ComponentProps<typeof SiteReactYouTubeVideoBlock>, "renderPreviewImage">>;

function renderDefaultPreviewImage(props: VideoPreviewImageProps) {
    return <VideoPreviewImage {...props} />;
}

/**
 * A client component, so that server components can render it without passing the `renderPreviewImage` function
 */
export function YouTubeVideoBlock({ renderPreviewImage = renderDefaultPreviewImage, ...props }: Props) {
    return <SiteReactYouTubeVideoBlock {...props} renderPreviewImage={renderPreviewImage} />;
}
