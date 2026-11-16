import { type ResolveImageSrcOptions, useConfig } from "../../config/ConfigProvider.js";

export function useResolvedImageSrc({ src, width, height }: Omit<ResolveImageSrcOptions, "src"> & { src: string | undefined }): string | undefined {
    const { resolveImageSrc } = useConfig();

    if (src === undefined || !resolveImageSrc) {
        return src;
    }

    return resolveImageSrc({ src, width, height });
}
