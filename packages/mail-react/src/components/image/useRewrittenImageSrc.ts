import { type RewriteImageSrcOptions, useConfig } from "../../config/ConfigProvider.js";

export function useRewrittenImageSrc({ src, width, height }: Omit<RewriteImageSrcOptions, "src"> & { src: string | undefined }): string | undefined {
    const { rewriteImageSrc } = useConfig();

    if (src === undefined || !rewriteImageSrc) {
        return src;
    }

    return rewriteImageSrc({ src, width, height });
}
