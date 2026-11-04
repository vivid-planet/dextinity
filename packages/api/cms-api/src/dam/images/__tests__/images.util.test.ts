import { describe, expect, it } from "vitest";

import { FocalPoint } from "../../../file-utils/focal-point.enum";
import type { DamFileImage } from "../../files/entities/file-image.entity";
import type { ImageCropArea } from "../entities/image-crop-area.entity";
import { calculateInheritAspectRatio } from "../images.util";

function makeImage(width: number, height: number): DamFileImage {
    return { width, height } as DamFileImage;
}

function makeCropArea(focalPoint: FocalPoint, width?: number, height?: number): ImageCropArea {
    return { focalPoint, width, height } as ImageCropArea;
}

describe("calculateInheritAspectRatio", () => {
    describe("SMART focal point", () => {
        it("should return the image's own aspect ratio", () => {
            const image = makeImage(800, 400);
            const cropArea = makeCropArea(FocalPoint.SMART);

            expect(calculateInheritAspectRatio(image, cropArea)).toBe(2);
        });

        it("should return a portrait ratio when image height exceeds width", () => {
            const image = makeImage(400, 800);
            const cropArea = makeCropArea(FocalPoint.SMART);

            expect(calculateInheritAspectRatio(image, cropArea)).toBe(0.5);
        });

        it("should return 1 for a square image", () => {
            const image = makeImage(600, 600);
            const cropArea = makeCropArea(FocalPoint.SMART);

            expect(calculateInheritAspectRatio(image, cropArea)).toBe(1);
        });
    });

    describe("non-SMART focal point with explicit crop dimensions", () => {
        it("should compute the ratio from the percentage-based crop area", () => {
            // crop 50% wide, 25% tall on a 1000x800 image → 500x200 effective → ratio 2.5
            const image = makeImage(1000, 800);
            const cropArea = makeCropArea(FocalPoint.CENTER, 50, 25);

            expect(calculateInheritAspectRatio(image, cropArea)).toBe(2.5);
        });

        it("should return the image ratio when crop covers the full area (100%x100%)", () => {
            const image = makeImage(800, 600);
            const cropArea = makeCropArea(FocalPoint.NORTHWEST, 100, 100);

            expect(calculateInheritAspectRatio(image, cropArea)).toBeCloseTo(800 / 600);
        });

        it("should work for corner focal points like SOUTHEAST", () => {
            // crop 40% wide, 80% tall on a 1000x1000 image → 400x800 → ratio 0.5
            const image = makeImage(1000, 1000);
            const cropArea = makeCropArea(FocalPoint.SOUTHEAST, 40, 80);

            expect(calculateInheritAspectRatio(image, cropArea)).toBe(0.5);
        });
    });

    describe("error cases", () => {
        it("should throw when crop width is missing for a non-SMART focal point", () => {
            const image = makeImage(800, 600);
            const cropArea = makeCropArea(FocalPoint.CENTER, undefined, 50);

            expect(() => calculateInheritAspectRatio(image, cropArea)).toThrow("Missing crop dimensions");
        });

        it("should throw when crop height is missing for a non-SMART focal point", () => {
            const image = makeImage(800, 600);
            const cropArea = makeCropArea(FocalPoint.CENTER, 50, undefined);

            expect(() => calculateInheritAspectRatio(image, cropArea)).toThrow("Missing crop dimensions");
        });

        it("should throw when both crop dimensions are missing for a non-SMART focal point", () => {
            const image = makeImage(800, 600);
            const cropArea = makeCropArea(FocalPoint.NORTHEAST);

            expect(() => calculateInheritAspectRatio(image, cropArea)).toThrow("Missing crop dimensions");
        });
    });
});
