"use client";

import type { HTMLAttributes } from "react";

import type { SvgImageBlockData } from "../blocks.generated";
import { withPreview } from "../iframebridge/withPreview";
import { PreviewSkeleton } from "../previewskeleton/PreviewSkeleton";
import type { PropsWithData } from "./PropsWithData";

interface SvgImageBlockProps extends PropsWithData<SvgImageBlockData> {
    width?: string | number | "auto";
    height?: string | number | "auto";
}

export const SvgImageBlock = withPreview(
    ({
        data: { damFile },
        width = "100%",
        height = "auto",
        ...restProps
    }: SvgImageBlockProps & Omit<HTMLAttributes<HTMLImageElement>, "width" | "height">) => {
        if (!damFile) {
            return <PreviewSkeleton type="media" hasContent={false} height={height === "auto" ? undefined : height} />;
        }
        return (
            <img
                src={damFile.fileUrl}
                width={width === "auto" ? undefined : width}
                height={height === "auto" ? undefined : height}
                alt={damFile.altText ?? ""}
                title={damFile.title ?? ""}
                {...restProps}
            />
        );
    },
    { label: "SvgImage" },
);
