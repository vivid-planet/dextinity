import { type VideoPreviewImageProps, VimeoVideoBlock as SiteReactVimeoVideoBlock } from "@dextinity/site-react";
import type { ComponentProps } from "react";

import { VideoPreviewImage } from "./helpers/VideoPreviewImage";

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type Props = MakeOptional<ComponentProps<typeof SiteReactVimeoVideoBlock>, "renderPreviewImage">;

export function VimeoVideoBlock(props: Props) {
    const defaultRenderPreviewImage = (props: VideoPreviewImageProps) => {
        return <VideoPreviewImage {...props} />;
    };
    const renderPreviewImage = props.renderPreviewImage ?? defaultRenderPreviewImage;
    return <SiteReactVimeoVideoBlock {...props} renderPreviewImage={renderPreviewImage} />;
}
