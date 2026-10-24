"use client";
import {
    type AiContentAltTextPrefixLabels,
    AiContentDisclosure,
    type AiContentDisclosureProps,
    calculateInheritAspectRatio,
    generateImageUrl,
    getAiContentAltTextWithPrefix,
    parseAspectRatio,
    PreviewSkeleton,
    type PropsWithData,
    withPreview,
} from "@dextinity/site-react";
import type { PixelImageBlockData } from "@src/blocks.generated";
import dextinityConfig from "@src/dextinity-config.json" with { type: "json" };
import clsx from "clsx";
import { type ImgHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";

import styles from "./PixelImageBlock.module.scss";

const { deviceSizes, imageSizes } = dextinityConfig.images;
const allSizes = [...imageSizes, ...deviceSizes].sort((a, b) => a - b);

// Same width selection as next/image, see https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/get-img-props.ts
function getWidths(sizes: string | undefined) {
    if (!sizes) {
        return deviceSizes;
    }
    const percentSizes = [...sizes.matchAll(/(^|\s)(1?\d?\d)vw/g)].map((match) => parseInt(match[2], 10));
    if (percentSizes.length === 0) {
        return allSizes;
    }
    const smallestRatio = Math.min(...percentSizes) * 0.01;
    return allSizes.filter((size) => size >= deviceSizes[0] * smallestRatio);
}

export interface PixelImageBlockProps
    extends PropsWithData<PixelImageBlockData>, Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height" | "alt"> {
    aspectRatio: string | number | "inherit";
    /**
     * Fill the parent element instead of rendering an own container with the aspect ratio. The parent must be positioned.
     */
    fill?: boolean;
    /**
     * Do not set an `alt` attribute. The alt text is set in the DAM.
     */
    alt?: never;
    /** Override props passed to the AI content disclosure badge. */
    aiContentDisclosureProps?: Partial<AiContentDisclosureProps>;
    /** Render your own AI content disclosure instead of the built-in badge. Pass `null` to render none, e.g. when the project renders its own. */
    aiContentDisclosure?: ReactNode;
    /** AI content prefix prepended to the alt text. Defaults to English; ideally pass a translated string here. */
    aiContentAltTextPrefixLabels?: Partial<AiContentAltTextPrefixLabels>;
}

export const PixelImageBlock = withPreview(
    ({
        aspectRatio,
        data: { damFile, cropArea, urlTemplate },
        fill,
        sizes = "100vw",
        className,
        style,
        aiContentDisclosureProps,
        aiContentDisclosure,
        aiContentAltTextPrefixLabels,
        ...imageProps
    }: PixelImageBlockProps) => {
        const imageRef = useRef<HTMLImageElement>(null);
        const [isLoaded, setIsLoaded] = useState(false);

        useEffect(() => {
            // The image might have finished loading before hydration
            if (imageRef.current?.complete) {
                setIsLoaded(true);
            }
        }, []);

        if (!damFile || !damFile.image) {
            return <PreviewSkeleton type="media" hasContent={false} aspectRatio={aspectRatio} fill={fill} />;
        }

        const altText = getAiContentAltTextWithPrefix({
            aiContentType: damFile.aiContentType,
            description: damFile.altText,
            prefixLabels: aiContentAltTextPrefixLabels,
        });

        // If we have a crop area set, DAM setting are overwritten, so we use that
        const usedCropArea = cropArea ?? damFile.image.cropArea;
        const usedAspectRatio = aspectRatio === "inherit" ? calculateInheritAspectRatio(damFile.image, usedCropArea) : parseAspectRatio(aspectRatio);

        const widths = getWidths(sizes);
        const srcSet = widths.map((width) => `${generateImageUrl({ src: urlTemplate, width }, usedAspectRatio)} ${width}w`).join(", ");

        const image = (
            <img
                ref={imageRef}
                src={generateImageUrl({ src: urlTemplate, width: widths[widths.length - 1] }, usedAspectRatio)}
                srcSet={srcSet}
                sizes={sizes}
                alt={altText}
                title={damFile.title ?? ""}
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                className={clsx(styles.image, className)}
                style={{ backgroundColor: isLoaded ? undefined : (damFile.image.dominantColor ?? undefined), ...style }}
                {...imageProps}
            />
        );

        const disclosure = damFile.aiContentType ? (
            aiContentDisclosure !== undefined ? (
                aiContentDisclosure
            ) : (
                <AiContentDisclosure type={damFile.aiContentType} {...aiContentDisclosureProps} />
            )
        ) : null;

        // default behavior when fill is set to true: do not wrap in container -> an own container must be used
        if (fill) {
            return (
                <>
                    {image}
                    {disclosure}
                </>
            );
        }

        return (
            <div className={styles.imageContainer} style={{ "--aspect-ratio": usedAspectRatio }}>
                {image}
                {disclosure}
            </div>
        );
    },
    { label: "PixelImage" },
);
