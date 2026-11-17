"use client";
import { generateImageUrl, parseAspectRatio } from "@dextinity/site-react";
import { type CSSProperties, type ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { preload as preloadResource } from "react-dom";

import { getImageWidths } from "./getImageWidths.js";
import { useImageConfig } from "./ImageConfigProvider.js";

const fillStyle: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height"> {
    /** URL template of the image, e.g. `urlTemplate` of a DAM file */
    src: string;
    aspectRatio: string | number;
    /** Fill the positioned parent element, cropped to cover it */
    fill?: boolean;
    /** Shown until the image has loaded, e.g. the dominant color of a DAM image */
    placeholderColor?: string;
    /** Load the image immediately with high priority, e.g. for the largest image above the fold */
    preload?: boolean;
}

export function Image({ src, aspectRatio, sizes = "100vw", fill, placeholderColor, preload, style, onLoad, ...imgProps }: ImageProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // The image might have finished loading before hydration
        if (imageRef.current?.complete) {
            setIsLoaded(true);
        }
    }, []);

    const usedAspectRatio = parseAspectRatio(aspectRatio);
    const widths = getImageWidths(useImageConfig(), sizes);
    const srcSet = widths.map((width) => `${generateImageUrl({ src, width }, usedAspectRatio)} ${width}w`).join(", ");
    const fallbackSrc = generateImageUrl({ src, width: widths[widths.length - 1] }, usedAspectRatio);

    if (preload) {
        preloadResource(fallbackSrc, { as: "image", imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: "high" });
    }

    return (
        <img
            ref={imageRef}
            src={fallbackSrc}
            srcSet={srcSet}
            sizes={sizes}
            loading={preload ? "eager" : "lazy"}
            fetchPriority={preload ? "high" : undefined}
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
