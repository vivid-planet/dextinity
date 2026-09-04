import { describe, expect, it } from "vitest";

import { createInitialCrop } from "./createInitialCrop";

// A landscape image, so a 5:3 crop is limited by the image's height
const image = { width: 4000, height: 2000 };

const aspect = 5 / 3;

const ratioOf = ({ width, height }: { width: number; height: number }) => (width * image.width) / (height * image.height);

describe("createInitialCrop", () => {
    it("returns the whole image without a stored crop area and without an aspect ratio", () => {
        expect(createInitialCrop({ image })).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    });

    it("returns the stored crop area unchanged without an aspect ratio", () => {
        expect(createInitialCrop({ cropArea: { width: 50, height: 40, x: 10, y: 20 }, image })).toEqual({ x: 10, y: 20, width: 50, height: 40 });
    });

    it("centers the largest possible crop without a stored crop area", () => {
        const crop = createInitialCrop({ aspect, image });

        expect(ratioOf(crop)).toBeCloseTo(aspect);
        // 5:3 of the image's full height is 3333x2000px
        expect(crop.width).toBeCloseTo(83.33);
        expect(crop.height).toBe(100);
        expect(crop.x).toBeCloseTo((100 - crop.width) / 2);
        expect(crop.y).toBe(0);
    });

    it("leaves a stored crop area that already has the aspect ratio in place", () => {
        // 1000x600px, which is 5:3
        const cropArea = { width: 25, height: 30, x: 10, y: 20 };

        expect(createInitialCrop({ cropArea, aspect, image })).toEqual({ x: 10, y: 20, width: 25, height: 30 });
    });

    it("corrects the shape of a stored crop area with another ratio, keeping its position", () => {
        // 1000x1000px, which is 1:1
        const crop = createInitialCrop({ cropArea: { width: 25, height: 50, x: 10, y: 20 }, aspect, image });

        expect(ratioOf(crop)).toBeCloseTo(aspect);
        expect(crop.x).toBe(10);
        expect(crop.y).toBe(20);
        expect(crop.width).toBe(25);
        expect(crop.height).toBe(30);
    });

    it("shrinks a corrected crop area that would reach past the image's edge", () => {
        // 3000x1000px at the bottom of the image, so growing to 5:3 would overflow
        const crop = createInitialCrop({ cropArea: { width: 75, height: 50, x: 0, y: 50 }, aspect, image });

        expect(ratioOf(crop)).toBeCloseTo(aspect);
        expect(crop.y + crop.height).toBeLessThanOrEqual(100);
    });

    it("centers the crop for a crop area without dimensions, as stored for a smart focal point", () => {
        expect(createInitialCrop({ cropArea: { width: null, height: null, x: null, y: null }, aspect, image })).toEqual(
            createInitialCrop({ aspect, image }),
        );
    });
});
