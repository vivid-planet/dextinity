import { mediaType } from "@hapi/accept";

import type { FocalPoint } from "./focal-point.js";

const JPEG = "image/jpeg";
const BASIC_TYPES = [JPEG, "image/png", "image/gif"];
export const MODERN_TYPES = ["image/avif", "image/webp"];

const extensionsByMimeType: Record<string, "jpg" | "png" | "gif" | "webp" | "avif"> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
};

interface ImageDimensions {
    width: number;
    height: number;
}

interface ImageCoordinates {
    x: number;
    y: number;
}

type ImageDimensionsAndCoordinates = ImageDimensions & ImageCoordinates;

export function getMaxDimensionsFromArea(area: ImageDimensions, aspectRatio: number): ImageDimensions {
    let width: number, height: number;
    if (aspectRatio < 1) {
        width = Math.min(area.height * aspectRatio, area.width);
        height = width / aspectRatio;
    } else {
        height = Math.min(area.width / aspectRatio, area.height);
        width = height * aspectRatio;
    }

    return { width: Math.ceil(width), height: Math.ceil(height) };
}

function getFocalPoint(area: ImageDimensionsAndCoordinates, focalPoint: FocalPoint): ImageCoordinates {
    switch (focalPoint) {
        case "NORTHWEST":
            return { x: area.width / 3, y: area.height / 3 };
        case "NORTHEAST":
            return { x: area.width - area.width / 3, y: area.height / 3 };
        case "SOUTHWEST":
            return { x: area.width / 3, y: area.height - area.height / 3 };
        case "SOUTHEAST":
            return { x: area.width - area.width / 3, y: area.height - area.height / 3 };
        default:
            return { x: area.width / 2, y: area.height / 2 };
    }
}

export function getCenteredPosition(crop: ImageDimensions, area: ImageDimensionsAndCoordinates, focalPoint: FocalPoint): ImageCoordinates {
    const center = getFocalPoint(area, focalPoint);

    let x = Math.max(center.x - crop.width / 2, 0);
    if (x + crop.width > area.width) {
        x -= x + crop.width - area.width;
    }
    // Can happen because width is rounded and x not
    x = Math.max(x, 0);

    let y = Math.max(center.y - crop.height / 2, 0);
    if (y + crop.height > area.height) {
        y -= y + crop.height - area.height;
    }
    y = Math.max(y, 0);

    return { x: x + area.x, y: y + area.y };
}

export function getSupportedMimeType(options: string[], accept = ""): string | undefined {
    const mimeType = mediaType(accept, options);
    if (!mimeType) {
        return undefined;
    }
    return accept.includes(mimeType) ? mimeType : undefined;
}

export function getBasicImageMimeType(mimetype: string): string {
    return getSupportedMimeType(BASIC_TYPES, mimetype) ?? JPEG;
}

export function getImageExtension(mimetype: string): "jpg" | "png" | "gif" | "webp" | "avif" {
    return extensionsByMimeType[mimetype] ?? "jpg";
}
