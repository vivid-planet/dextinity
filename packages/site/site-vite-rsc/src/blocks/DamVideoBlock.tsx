"use client";
import { DamVideoBlock as SiteReactDamVideoBlock, type VideoPreviewImageProps } from "@dextinity/site-react";
import type { ComponentProps } from "react";

import { VideoPreviewImage } from "./VideoPreviewImage.js";

type Props = Omit<ComponentProps<typeof SiteReactDamVideoBlock>, "renderPreviewImage"> &
    Partial<Pick<ComponentProps<typeof SiteReactDamVideoBlock>, "renderPreviewImage">>;

function renderDefaultPreviewImage(props: VideoPreviewImageProps) {
    return <VideoPreviewImage {...props} />;
}

export function DamVideoBlock({ renderPreviewImage = renderDefaultPreviewImage, ...props }: Props) {
    return <SiteReactDamVideoBlock {...props} renderPreviewImage={renderPreviewImage} />;
}
