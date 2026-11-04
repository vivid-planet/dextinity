"use client";
import {
    type AiContentAltTextPrefixLabels,
    AiContentDisclosure,
    type AiContentDisclosureProps,
    calculateInheritAspectRatio,
    getAiContentAltTextWithPrefix,
    parseAspectRatio,
    PreviewSkeleton,
    type PropsWithData,
    withPreview,
} from "@dextinity/site-react";
import type { ReactNode } from "react";

import type { PixelImageBlockData } from "../blocks.generated";
import { Image, type ImageProps } from "../image/Image";
import styles from "./PixelImageBlock.module.scss";

export interface PixelImageBlockProps extends PropsWithData<PixelImageBlockData>, Omit<ImageProps, "src" | "aspectRatio" | "alt"> {
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
        style,
        ...imageProps
    }: PixelImageBlockProps) => {
        const altText = getAiContentAltTextWithPrefix({
            aiContentType: damFile?.aiContentType,
            description: damFile?.altText,
            prefixLabels: aiContentAltTextPrefixLabels,
        });

        if (!damFile || !damFile.image) {
            return <PreviewSkeleton type="media" hasContent={false} aspectRatio={aspectRatio} fill={fill} />;
        }

        // A crop area of the block overrides the one of the DAM
        const usedCropArea = cropArea ?? damFile.image.cropArea;
        const usedAspectRatio = aspectRatio === "inherit" ? calculateInheritAspectRatio(damFile.image, usedCropArea) : parseAspectRatio(aspectRatio);

        const image = (
            <Image
                src={urlTemplate}
                aspectRatio={usedAspectRatio}
                fill
                placeholderColor={damFile.image.dominantColor ?? undefined}
                alt={altText}
                title={damFile.title ?? ""}
                style={{ objectFit: "cover", ...style }}
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

        // With fill, the image fills the positioned parent element instead of a container of its own
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
