import { mediaType } from "@hapi/accept";
import mime from "mime";

import { Extension } from "../imgproxy/imgproxy.enum";
import { FocalPoint } from "./focal-point.enum";
import { BASIC_TYPES, MODERN_TYPES } from "./images.constants";

interface ImageDimensions {
    width: number;
    height: number;
}

interface ImageCoordinates {
    x: number;
    y: number;
}

export interface ImageDimensionsAndCoordinates extends ImageDimensions, ImageCoordinates {}

export function getMaxDimensionsFromArea(area: ImageDimensions, aspectRatio: number): ImageDimensions {
    let width: number, height: number;
    if (aspectRatio < 1) {
        width = Math.min(area.height * aspectRatio, area.width);
        height = width / aspectRatio;
    } else {
        height = Math.min(area.width / aspectRatio, area.height);
        width = height * aspectRatio;
    }

    return {
        width: Math.ceil(width),
        height: Math.ceil(height),
    };
}

function getFocalPoint(area: ImageDimensionsAndCoordinates, focalPointPosition: FocalPoint): { x: number; y: number } {
    let x: number, y: number;
    if (focalPointPosition === FocalPoint.NORTHWEST) {
        x = area.width / 3;
        y = area.height / 3;
    } else if (focalPointPosition === FocalPoint.NORTHEAST) {
        x = area.width - area.width / 3;
        y = area.height / 3;
    } else if (focalPointPosition === FocalPoint.SOUTHWEST) {
        x = area.width / 3;
        y = area.height - area.height / 3;
    } else if (focalPointPosition === FocalPoint.SOUTHEAST) {
        x = area.width - area.width / 3;
        y = area.height - area.height / 3;
    } else {
        x = area.width / 2;
        y = area.height / 2;
    }

    return {
        x,
        y,
    };
}

export function getCenteredPosition(crop: ImageDimensions, area: ImageDimensionsAndCoordinates, focalPointPosition: FocalPoint): ImageCoordinates {
    const focalPoint = getFocalPoint(area, focalPointPosition);

    let x = Math.max(focalPoint.x - crop.width / 2, 0);
    if (x + crop.width > area.width) {
        x -= x + crop.width - area.width;
    }
    if (x < 0) {
        x = 0;
    } // Can happen because width is rounded and x not

    let y = Math.max(focalPoint.y - crop.height / 2, 0);
    if (y + crop.height > area.height) {
        y -= y + crop.height - area.height;
    }
    if (y < 0) {
        y = 0;
    } // Can happen because height is rounded and y not

    return { x: x + area.x, y: y + area.y };
}

export function getSupportedMimeType(options: string[], accept = ""): string | undefined {
    const mimeType = mediaType(accept, options);
    if (!mimeType) {
        return undefined;
    }
    return accept.includes(mimeType) ? mimeType : undefined;
}

export function getImageOutputExtension({
    accept,
    sourceMimetype,
    negotiateFormat,
}: {
    accept: string;
    sourceMimetype: string;
    negotiateFormat: boolean;
}): Extension {
    const negotiatedMimeType = negotiateFormat ? getSupportedMimeType(MODERN_TYPES, accept) : undefined;
    return (mime.getExtension(negotiatedMimeType ?? getSupportedMimeType(BASIC_TYPES, sourceMimetype) ?? "") as Extension) || Extension.JPG;
}
