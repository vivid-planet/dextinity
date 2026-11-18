import type { PixelImageBlockData as PixelImageBlockSourceData } from "../../blocks.generated.js";
import { usePixelImageBlockConfig } from "./usePixelImageBlockConfig.js";

interface UsePixelImageBlockDataProps {
    data: PixelImageBlockSourceData;
    defaultRenderWidth: number;
    largestPossibleRenderWidth?: number;
    aspectRatio?: number | string;
}

interface PixelImageBlockData {
    imageUrl: string;
    defaultRenderWidth: number;
    desktopImageHeight: number;
    alt: string | undefined;
    title: string | undefined;
}

export function usePixelImageBlockData({
    data: { damFile, cropArea, urlTemplate },
    defaultRenderWidth,
    largestPossibleRenderWidth,
    aspectRatio: passedAspectRatio,
}: UsePixelImageBlockDataProps): PixelImageBlockData | null {
    const { validSizes, baseUrl } = usePixelImageBlockConfig();

    if (!damFile?.image) {
        return null;
    }

    const usedCropArea = cropArea ?? damFile.image.cropArea;
    const aspectRatio = passedAspectRatio !== undefined ? parseAspectRatio(passedAspectRatio) : calculateAspectRatio(damFile.image, usedCropArea);

    const optimalWidth = getOptimalAllowedImageWidth(validSizes, Math.max(defaultRenderWidth, largestPossibleRenderWidth ?? 0));
    const resolvedImageUrl = generateImageUrl(urlTemplate, optimalWidth, aspectRatio);

    return {
        imageUrl: isAbsoluteUrl(resolvedImageUrl) ? resolvedImageUrl : `${baseUrl}${resolvedImageUrl}`,
        defaultRenderWidth,
        desktopImageHeight: Math.round(defaultRenderWidth / aspectRatio),
        alt: damFile.altText ?? undefined,
        title: damFile.title ?? undefined,
    };
}

function isAbsoluteUrl(url: string): boolean {
    return !url.startsWith("/");
}

function getOptimalAllowedImageWidth(validSizes: number[], largestRenderWidth: number): number {
    const sortedValidSizes = [...validSizes].sort((a, b) => a - b);
    return sortedValidSizes.find((validWidth) => validWidth >= largestRenderWidth * 2) ?? sortedValidSizes[sortedValidSizes.length - 1];
}

interface ImageDimensions {
    width: number;
    height: number;
}

interface CropArea {
    focalPoint: "SMART" | "CENTER" | "NORTHWEST" | "NORTHEAST" | "SOUTHWEST" | "SOUTHEAST";
    width?: number | null;
    height?: number | null;
    x?: number | null;
    y?: number | null;
}

// Copied from `calculateInheritAspectRatio` in `@dextinity/site-react` (`src/image/image.utils.ts`).
// Keep in sync with the site-react version when changes are made.
function calculateAspectRatio(image: ImageDimensions, cropArea: CropArea): number {
    if (cropArea.focalPoint === "SMART") {
        return image.width / image.height;
    }

    if (cropArea.width == null || cropArea.height == null) {
        throw new Error("Missing crop dimensions");
    }

    return (cropArea.width * image.width) / (cropArea.height * image.height);
}

// Copied from `generateImageUrl` in `@dextinity/site-react` (`src/image/image.utils.ts`).
// Keep in sync with the site-react version when changes are made.
function generateImageUrl(urlTemplate: string, width: number, aspectRatio: number): string {
    return urlTemplate.replace("$resizeWidth", String(width)).replace("$resizeHeight", String(Math.ceil(width / aspectRatio)));
}

// Copied from `parseAspectRatio` in `@dextinity/site-react` (`src/image/image.utils.ts`).
// Keep in sync with the site-react version when changes are made.
function parseAspectRatio(value: number | string): number {
    let width: number | undefined;
    let height: number | undefined;

    if (typeof value === "string") {
        [width, height] = value.split(/[x/:]/).map((part) => {
            const parsed = parseFloat(part);
            return isNaN(parsed) ? undefined : parsed;
        });
        if (width && !height) {
            height = 1;
        }
    } else {
        width = value;
        height = 1;
    }

    if (!width || !height) {
        throw new Error(`An error occurred while parsing the aspect ratio: ${value}`);
    }

    return width / height;
}
