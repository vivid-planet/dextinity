"use client";
import { generateImageUrl, parseAspectRatio } from "@dextinity/site-react";
import { type CSSProperties, type ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

import { getImageWidths } from "./getImageWidths";
import { useImageConfig } from "./ImageConfigProvider";

const fillStyle: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height" | "placeholder"> {
    /** The URL template of the image, e.g. `urlTemplate` of a DAM file */
    src: string;
    aspectRatio: string | number;
    /** Fills the positioned parent element */
    fill?: boolean;
    /** Shown until the image has loaded, e.g. the dominant color of a DAM image */
    placeholderColor?: string;
    /** Loads the image immediately with a high priority, e.g. for the largest image above the fold */
    priority?: boolean;
}

/**
 * An image of the API's image proxy with a `srcset` of the widths of the `ImageConfigProvider`, the counterpart of `Image` of `@dextinity/site-nextjs`
 */
export function Image({ src, aspectRatio, sizes, fill, placeholderColor, priority, style, onLoad, alt = "", ...imgProps }: ImageProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const imageConfig = useImageConfig();

    useEffect(() => {
        // The image can finish loading before hydration, which doesn't call onLoad
        if (imageRef.current?.complete) {
            setIsLoaded(true);
        }
    }, []);

    const usedAspectRatio = parseAspectRatio(aspectRatio);
    const widths = getImageWidths(imageConfig, sizes);
    const srcSet = widths.map((width) => `${generateImageUrl({ src, width }, usedAspectRatio)} ${width}w`).join(", ");
    const fallbackSrc = generateImageUrl({ src, width: widths[widths.length - 1] }, usedAspectRatio);
    const usedSizes = sizes ?? "100vw";

    if (priority) {
        preload(fallbackSrc, { as: "image", imageSrcSet: srcSet, imageSizes: usedSizes, fetchPriority: "high" });
    }

    return (
        <img
            ref={imageRef}
            src={fallbackSrc}
            srcSet={srcSet}
            sizes={usedSizes}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            onLoad={(event) => {
                setIsLoaded(true);
                onLoad?.(event);
            }}
            style={{ ...(fill && fillStyle), backgroundColor: isLoaded ? undefined : placeholderColor, ...style }}
            {...imgProps}
        />
    );
}
