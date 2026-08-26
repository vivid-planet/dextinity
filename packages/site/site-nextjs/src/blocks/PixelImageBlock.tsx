"use client";
import {
    type AiContentAltTextPrefixLabels,
    AiContentDisclosure,
    type AiContentDisclosureProps,
    calculateInheritAspectRatio,
    generateImageUrl,
    getAiContentAltTextWithPrefix,
    getMaxDimensionsFromArea,
    type ImageDimensions,
    parseAspectRatio,
    PreviewSkeleton,
    type PropsWithData,
    withPreview,
} from "@dextinity/site-react";
// eslint-disable-next-line no-restricted-imports
import NextImageImport, { type ImageProps } from "next/image";
import type { ReactNode } from "react";

import type { PixelImageBlockData } from "../blocks.generated";
import styles from "./PixelImageBlock.module.scss";

// `next/image` is a CJS module; under Next.js Pages Router its default import
// from this ESM package yields the module-namespace object instead of the
// component (Node-style ESM↔CJS interop). Unwrap so the component works under
// both bundler-style and Node-style interop.
const NextImage: typeof NextImageImport = (NextImageImport as unknown as { default?: typeof NextImageImport }).default ?? NextImageImport;

interface PixelImageBlockProps extends PropsWithData<PixelImageBlockData>, Omit<ImageProps, "src" | "width" | "height" | "alt"> {
    aspectRatio: string | number | "inherit";
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
        aiContentDisclosureProps,
        aiContentDisclosure,
        aiContentAltTextPrefixLabels,
        ...nextImageProps
    }: PixelImageBlockProps) => {
        const altText = getAiContentAltTextWithPrefix({
            aiContentType: damFile?.aiContentType,
            description: damFile?.altText,
            prefixLabels: aiContentAltTextPrefixLabels,
        });

        if (!damFile || !damFile.image) {
            return <PreviewSkeleton type="media" hasContent={false} aspectRatio={aspectRatio} fill={fill} />;
        }

        // If we have a crop area set, DAM setting are overwritten, so we use that
        const usedCropArea = cropArea ?? damFile.image.cropArea;

        let usedAspectRatio: number;

        if (aspectRatio === "inherit") {
            usedAspectRatio = calculateInheritAspectRatio(damFile.image, usedCropArea);
        } else {
            usedAspectRatio = parseAspectRatio(aspectRatio);
        }

        let dimensions: ImageDimensions;

        // check if image is cropped
        if (usedCropArea.width && usedCropArea.height) {
            dimensions = getMaxDimensionsFromArea(
                {
                    width: (usedCropArea.width * damFile.image.width) / 100,
                    height: (usedCropArea.height * damFile.image.height) / 100,
                },
                usedAspectRatio,
            );
        }
        // as a fallback use image dimensions
        else {
            dimensions = getMaxDimensionsFromArea(
                {
                    width: damFile.image.width,
                    height: damFile.image.height,
                },
                usedAspectRatio,
            );
        }

        const blurDataUrl = createDominantImageDataUrl(dimensions.width, dimensions.height, damFile.image.dominantColor);

        const nextImage = (
            <NextImage
                loader={(loaderProps) => generateImageUrl(loaderProps, usedAspectRatio)}
                src={urlTemplate}
                fill
                style={{ objectFit: "cover" }}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                alt={altText}
                title={damFile.title ?? ""}
                {...nextImageProps}
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
                    {nextImage}
                    {disclosure}
                </>
            );
        }

        return (
            <div className={styles.imageContainer} style={{ "--aspect-ratio": usedAspectRatio }}>
                {nextImage}
                {disclosure}
            </div>
        );
    },
    { label: "PixelImage" },
);

// to be used as placeholderImage
function createDominantImageDataUrl(w: number, h: number, dominantColor = "#ffffff"): string {
    const toBase64 = (str: string) => (typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str));

    const svg = `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="${w}" height="${h}" fill="${dominantColor}" />
</svg>`;

    return `data:image/svg+xml;base64,${toBase64(svg)}`;
}
