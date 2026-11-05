"use client";
import { type VideoPreviewImageProps, VimeoVideoBlock as SiteReactVimeoVideoBlock } from "@dextinity/site-react";
import type { ComponentProps } from "react";

import { VideoPreviewImage } from "./VideoPreviewImage";

type Props = Omit<ComponentProps<typeof SiteReactVimeoVideoBlock>, "renderPreviewImage"> &
    Partial<Pick<ComponentProps<typeof SiteReactVimeoVideoBlock>, "renderPreviewImage">>;

function renderDefaultPreviewImage(props: VideoPreviewImageProps) {
    return <VideoPreviewImage {...props} />;
}

/**
 * A client component, so that server components can render it without passing the `renderPreviewImage` function
 */
export function VimeoVideoBlock({ renderPreviewImage = renderDefaultPreviewImage, ...props }: Props) {
    return <SiteReactVimeoVideoBlock {...props} renderPreviewImage={renderPreviewImage} />;
}
