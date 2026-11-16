type CropArea = {
    focalPoint: string;
    width?: number | null;
    height?: number | null;
};

/**
 * Check if a crop area can be used to crop an image.
 * Crop areas without dimensions (e.g., created by older Dextinity versions) must be treated as if no crop area was set at all.
 */
export function isUsableCropArea(cropArea: CropArea): boolean {
    return cropArea.focalPoint === "SMART" || (Boolean(cropArea.width) && Boolean(cropArea.height));
}

// A focal point without a crop area applies to the entire image
export const fullCropArea = { x: 0, y: 0, width: 100, height: 100 };
