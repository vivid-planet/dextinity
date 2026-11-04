"use client";
import { type ImageProps, PixelImageBlock, PreviewSkeleton, type PropsWithData, SvgImageBlock, withPreview } from "@dextinity/site-react-router";
import type { DamImageBlockData, PixelImageBlockData, SvgImageBlockData } from "@src/blocks.generated";
import { useAiContentAltTextPrefixLabels } from "@src/common/helpers/useAiContentAltTextPrefixLabels";

type DamImageProps = Omit<ImageProps, "src" | "aspectRatio" | "alt"> & {
    aspectRatio: string | "inherit";
    /**
     * Do not set an `alt` attribute. The alt text is set in the DAM.
     */
    alt?: never;
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
