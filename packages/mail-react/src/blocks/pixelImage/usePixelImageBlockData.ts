import type { PixelImageBlockData as PixelImageBlockSourceData } from "../../blocks.generated.js";
import { useTheme } from "../../theme/ThemeProvider.js";
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
    largestPossibleRenderWidth: passedLargestPossibleRenderWidth,
    aspectRatio: passedAspectRatio,
}: UsePixelImageBlockDataProps): PixelImageBlockData | null {
    const theme = useTheme();
    const { validSizes, baseUrl } = usePixelImageBlockConfig();
    const largestPossibleRenderWidth = passedLargestPossibleRenderWidth ?? theme.sizes.bodyWidth;

    if (!damFile?.image) {
        return null;
    }

    const usedCropArea = cropArea ?? damFile.image.cropArea;
    const aspectRatio = passedAspectRatio !== undefined ? parseAspectRatio(passedAspectRatio) : calculateAspectRatio(damFile.image, usedCropArea);

    const optimalWidth = getOptimalAllowedImageWidth(validSizes, defaultRenderWidth, largestPossibleRenderWidth);
    const resolvedImageUrl = generateImageUrl(urlTemplate, optimalWidth, aspectRatio);

    return {
        imageUrl: isAbsoluteUrl(resolvedImageUrl) ? resolvedImageUrl : `${baseUrl}${resolvedImageUrl}`,
        defaultRenderWidth,
        desktopImageHeight: Math.round(defaultRenderWidth / aspectRatio),
        alt: damFile.altText,
        title: damFile.title,
    };
}

function isAbsoluteUrl(url: string): boolean {
    return !url.startsWith("/");
}

function getOptimalAllowedImageWidth(validSizes: number[], defaultRenderWidth: number, largestPossibleRenderWidth: number): number {
    const sortedValidSizes = validSizes.sort((a, b) => a - b);

    let width: number | null = null;
    const largestPossibleWidth = sortedValidSizes[sortedValidSizes.length - 1];

    sortedValidSizes.forEach((validWidth) => {
        if (defaultRenderWidth === largestPossibleRenderWidth) {
            width = largestPossibleRenderWidth * 2;
        } else if (!width && validWidth >= defaultRenderWidth * 2) {
            width = validWidth;
        }
    });

    if (!width) {
        return largestPossibleWidth;
    }

    return width;
}

interface ImageDimensions {
    width: number;
    height: number;
}

interface CropArea {
    focalPoint: "SMART" | "CENTER" | "NORTHWEST" | "NORTHEAST" | "SOUTHWEST" | "SOUTHEAST";
    width?: number;
    height?: number;
    x?: number;
    y?: number;
}

// Copied from `calculateInheritAspectRatio` in `@dextinity/site-react` (`src/image/image.utils.ts`).
// Keep in sync with the site-react version when changes are made.
function calculateAspectRatio(image: ImageDimensions, cropArea: CropArea): number {
    if (cropArea.focalPoint === "SMART") {
        return image.width / image.height;
    }

    if (cropArea.width === undefined || cropArea.height === undefined) {
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
