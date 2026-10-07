import type { DamFileImage } from "../files/entities/file-image.entity";
import type { ImageCropArea } from "./entities/image-crop-area.entity";

/**
 * Check if a crop area can be used to crop an image.
 * Crop areas without dimensions (e.g., created by older Dextinity versions) must be treated as if no crop area was set at all.
 *
 * @param cropArea the crop area
 * @returns whether the crop area is usable
 */
export function isUsableCropArea(cropArea: ImageCropArea): boolean {
    if (cropArea.focalPoint === "SMART") {
        return true;
    }

    return Boolean(cropArea.width) && Boolean(cropArea.height);
}

/**
 * Calculate a DAM image's aspect ratio based on a specified crop area.
 * The crop area can be specified by an image's usage (e.g., in a PixelImageBlock) or in the DAM.
 *
 * @param image the DAM image
 * @param cropArea the crop area
 * @returns the calculated aspect ratio
 */
export function calculateInheritAspectRatio(image: DamFileImage, cropArea: ImageCropArea): number {
    if (cropArea.focalPoint === "SMART") {
        return image.width / image.height;
    } else {
        if (cropArea.width === undefined || cropArea.height === undefined) {
            throw new Error("Missing crop dimensions");
        }

        return (cropArea.width * image.width) / 100 / ((cropArea.height * image.height) / 100);
    }
}
