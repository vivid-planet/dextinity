import type { ImageConfig } from "./ImageConfigProvider";

/**
 * The widths of the `srcset` of an image, selected like next/image does it for a `sizes` attribute:
 * with relative sizes like `50vw`, widths that are too small for the smallest device are left out.
 */
export function getImageWidths({ deviceSizes, imageSizes }: ImageConfig, sizes: string | undefined): number[] {
    const allSizes = [...imageSizes, ...deviceSizes].sort((a, b) => a - b);
    if (!sizes) {
        return [...deviceSizes].sort((a, b) => a - b);
    }
    const viewportWidthPercentages = [...sizes.matchAll(/(^|\s)(1?\d?\d)vw/g)].map((match) => parseInt(match[2], 10));
    if (viewportWidthPercentages.length === 0) {
        return allSizes;
    }
    const smallestRatio = Math.min(...viewportWidthPercentages) * 0.01;
    const smallestDeviceSize = Math.min(...deviceSizes);
    return allSizes.filter((size) => size >= smallestDeviceSize * smallestRatio);
}
