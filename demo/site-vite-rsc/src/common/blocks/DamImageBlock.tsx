"use client";
import { PreviewSkeleton, type PropsWithData, SvgImageBlock, withPreview } from "@dextinity/site-react";
import { PixelImageBlock, type PixelImageBlockProps } from "@dextinity/site-vite-rsc";
import type { DamImageBlockData, PixelImageBlockData, SvgImageBlockData } from "@src/blocks.generated";
import { useAiContentAltTextPrefixLabels } from "@src/common/helpers/useAiContentAltTextPrefixLabels";

type DamImageProps = Omit<PixelImageBlockProps, "data" | "aspectRatio" | "aiContentAltTextPrefixLabels"> & {
    aspectRatio: string | "inherit";
};

export const DamImageBlock = withPreview(
    ({ data: { block }, aspectRatio, ...imageProps }: PropsWithData<DamImageBlockData> & DamImageProps) => {
        const aiContentAltTextPrefixLabels = useAiContentAltTextPrefixLabels();

        if (!block) {
            return <PreviewSkeleton type="media" hasContent={false} />;
        }

        if (block.type === "pixelImage") {
            return (
                <PixelImageBlock
                    data={block.props as PixelImageBlockData}
                    aspectRatio={aspectRatio}
                    aiContentAltTextPrefixLabels={aiContentAltTextPrefixLabels}
                    {...imageProps}
                />
            );
        } else if (block.type === "svgImage") {
            return <SvgImageBlock data={block.props as SvgImageBlockData} />;
        } else {
            return (
                <>
                    Unknown block type: <strong>{block.type}</strong>
                </>
            );
        }
    },
    { label: "Image" },
);
