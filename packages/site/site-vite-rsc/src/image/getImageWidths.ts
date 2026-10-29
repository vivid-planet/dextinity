import type { ImageConfig } from "./ImageConfigProvider.js";

// Same selection as next/image, see https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/get-img-props.ts
export function getImageWidths({ deviceSizes, imageSizes }: ImageConfig, sizes: string): number[] {
    const allSizes = [...imageSizes, ...deviceSizes].sort((a, b) => a - b);
    const percentSizes = [...sizes.matchAll(/(^|\s)(1?\d?\d)vw/g)].map((match) => parseInt(match[2], 10));
    if (percentSizes.length === 0) {
        return allSizes;
    }
    const smallestRatio = Math.min(...percentSizes) * 0.01;
    return allSizes.filter((size) => size >= Math.min(...deviceSizes) * smallestRatio);
}
