import { centerCrop, makeAspectCrop, type PercentCrop } from "react-image-crop";

type StoredCropArea = {
    width?: number | null;
    height?: number | null;
    x?: number | null;
    y?: number | null;
};

export type InitialCrop = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export const fullImageCrop: InitialCrop = { x: 0, y: 0, width: 100, height: 100 };

/**
 * Builds the crop the edit image dialog opens with, as a percentage of each axis.
 *
 * `ReactCrop`'s `aspect` constrains dragging, but doesn't correct the crop it is given. The initial crop therefore has
 * to be built at the requested ratio, otherwise the dialog opens with a rectangle of the wrong shape that the first
 * drag then corrects.
 *
 * @param cropArea The stored crop area. A crop area with a smart focal point has no dimensions and is read as the whole image.
 * @param aspect The ratio the crop is locked to. The stored crop area is used as-is when undefined.
 * @param image The image's dimensions in pixels, needed because the stored percentages are relative to them.
 */
export function createInitialCrop({
    cropArea,
    aspect,
    image,
}: {
    cropArea?: StoredCropArea;
    aspect?: number;
    image: { width: number; height: number };
}): InitialCrop {
    const storedCrop: PercentCrop | undefined =
        cropArea?.width && cropArea.height
            ? { unit: "%", width: cropArea.width, height: cropArea.height, x: cropArea.x ?? 0, y: cropArea.y ?? 0 }
            : undefined;

    let crop: PercentCrop = storedCrop ?? { unit: "%", ...fullImageCrop };

    if (aspect !== undefined) {
        crop = makeAspectCrop(crop, aspect, image.width, image.height);

        // A crop the editor set keeps its position, one covering the whole image is moved to the middle.
        if (storedCrop === undefined) {
            crop = centerCrop(crop, image.width, image.height);
        }
    }

    const { x, y, width, height } = crop;
    return { x, y, width, height };
}
