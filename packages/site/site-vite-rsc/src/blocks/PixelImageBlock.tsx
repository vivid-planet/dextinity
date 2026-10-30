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
import type { CSSProperties, ReactNode } from "react";

import type { PixelImageBlockData } from "../blocks.generated.js";
import { Image, type ImageProps } from "../image/Image.js";

export interface PixelImageBlockProps
    extends PropsWithData<PixelImageBlockData>, Omit<ImageProps, "src" | "aspectRatio" | "placeholderColor" | "alt"> {
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
        aiContentDisclosureProps,
        aiContentDisclosure,
        aiContentAltTextPrefixLabels,
        ...imageProps
    }: PixelImageBlockProps) => {
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

        const image = (
            <Image
                src={urlTemplate}
                aspectRatio={usedAspectRatio}
                fill
                placeholderColor={damFile.image.dominantColor ?? undefined}
                alt={altText}
                title={damFile.title ?? undefined}
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

        const containerStyle: CSSProperties = { position: "relative", width: "100%", aspectRatio: usedAspectRatio };
        return (
            <div style={containerStyle}>
                {image}
                {disclosure}
            </div>
        );
    },
    { label: "PixelImage" },
);
