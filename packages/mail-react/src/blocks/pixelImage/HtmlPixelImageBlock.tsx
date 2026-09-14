import clsx from "clsx";
import type { ReactNode } from "react";

import { HtmlImage, type HtmlImageProps } from "../../components/image/HtmlImage.js";
import type { PixelImageBlockBaseProps } from "./common.js";
import { usePixelImageBlockData } from "./usePixelImageBlockData.js";

export type HtmlPixelImageBlockProps = Omit<HtmlImageProps, "src" | "width" | "height"> & PixelImageBlockBaseProps;

/**
 * Renders a pixel-image from the DAM as a raw `<img>` tag.
 *
 * Use within raw HTML context — HTML-only emails or
 * [MJML ending tags](https://documentation.mjml.io/#ending-tags) like `MjmlRaw`.
 * Inside `MjmlRaw` in an `MjmlColumn`, place `HtmlPixelImageBlock` in a `<tr>` and `<td>` of its own.
 * For MJML context, use `MjmlPixelImageBlock`.
 */
export function HtmlPixelImageBlock({
    data,
    width,
    largestPossibleRenderWidth,
    aspectRatio,
    className,
    ...imgProps
}: HtmlPixelImageBlockProps): ReactNode {
    const imageData = usePixelImageBlockData({ data, defaultRenderWidth: width, largestPossibleRenderWidth, aspectRatio });

    if (!imageData) {
        return null;
    }

    return (
        <HtmlImage
            src={imageData.imageUrl}
            width={imageData.defaultRenderWidth}
            height={imageData.desktopImageHeight}
            alt={imageData.alt}
            title={imageData.title}
            className={clsx("htmlPixelImageBlock", className)}
            {...imgProps}
        />
    );
}
