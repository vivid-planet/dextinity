import type { ImgHTMLAttributes } from "react";

import { generateImageUrl, parseAspectRatio } from "./image.utils";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & { aspectRatio: string | number; src: string; width: string | number };

export function Image({ aspectRatio, src, width, ...imgProps }: ImageProps) {
    const usedAspectRatio = parseAspectRatio(aspectRatio);
    const imageUrl = generateImageUrl({ src, width: Number(width) }, usedAspectRatio);

    return <img src={imageUrl} {...imgProps} />;
}
