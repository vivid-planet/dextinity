import { describe, expect, it } from "vitest";

import { FocalPoint } from "../focal-point.enum";
import { getCenteredPosition, getMaxDimensionsFromArea, getSupportedMimeType } from "../images.util";

describe("getMaxDimensionsFromArea", () => {
    it("returns full area for 1:1 aspect ratio in a square area", () => {
        expect(getMaxDimensionsFromArea({ width: 200, height: 200 }, 1)).toEqual({ width: 200, height: 200 });
    });

    it("constrains by height for a wide aspect ratio in a landscape area", () => {
        // area 200x100, ratio 2 → height=100, width=200
        expect(getMaxDimensionsFromArea({ width: 200, height: 100 }, 2)).toEqual({ width: 200, height: 100 });
    });

    it("constrains by width when aspect ratio would overflow", () => {
        // area 200x100, ratio 4 → height=min(200/4,100)=50, width=200
        expect(getMaxDimensionsFromArea({ width: 200, height: 100 }, 4)).toEqual({ width: 200, height: 50 });
    });

    it("handles portrait aspect ratio (< 1) constrained by area height", () => {
        // area 200x300, ratio 0.5 → width=min(300*0.5,200)=150, height=150/0.5=300
        expect(getMaxDimensionsFromArea({ width: 200, height: 300 }, 0.5)).toEqual({ width: 150, height: 300 });
    });

    it("handles portrait aspect ratio (< 1) constrained by area width", () => {
        // area 100x300, ratio 0.5 → width=min(300*0.5,100)=100, height=100/0.5=200
        expect(getMaxDimensionsFromArea({ width: 100, height: 300 }, 0.5)).toEqual({ width: 100, height: 200 });
    });

    it("ceils fractional dimensions", () => {
        // area 100x100, ratio 3 → height=min(100/3,100)=33.33, width=33.33*3=100; ceil → height=34, width=100? Let's see
        // Actually: height = min(100/3, 100) = 33.333, width = 33.333 * 3 = 100; ceil(100)=100, ceil(33.333)=34
        expect(getMaxDimensionsFromArea({ width: 100, height: 100 }, 3)).toEqual({ width: 100, height: 34 });
    });
});

describe("getCenteredPosition", () => {
    it("centers crop on CENTER focal point", () => {
        const area = { width: 200, height: 200, x: 0, y: 0 };
        const crop = { width: 100, height: 100 };
        // focalPoint = {x:100, y:100}; result x=50, y=50
        expect(getCenteredPosition(crop, area, FocalPoint.CENTER)).toEqual({ x: 50, y: 50 });
    });

    it("adds area offset to result", () => {
        const area = { width: 200, height: 200, x: 10, y: 20 };
        const crop = { width: 100, height: 100 };
        // x=50+10=60, y=50+20=70
        expect(getCenteredPosition(crop, area, FocalPoint.CENTER)).toEqual({ x: 60, y: 70 });
    });

    it("clamps to left/top boundary when focal point is near NORTHWEST", () => {
        const area = { width: 300, height: 300, x: 0, y: 0 };
        const crop = { width: 300, height: 300 };
        // focal: x=100, y=100; x=max(100-150,0)=0; 0+300=300 ok; y same
        expect(getCenteredPosition(crop, area, FocalPoint.NORTHWEST)).toEqual({ x: 0, y: 0 });
    });

    it("clamps to right/bottom boundary when crop would overflow for SOUTHEAST focal point", () => {
        const area = { width: 300, height: 300, x: 0, y: 0 };
        const crop = { width: 250, height: 250 };
        // focal: x=300-100=200, y=200; x=max(200-125,0)=75; 75+250=325>300 → x=50; same for y
        expect(getCenteredPosition(crop, area, FocalPoint.SOUTHEAST)).toEqual({ x: 50, y: 50 });
    });

    it("positions crop near top-right for NORTHEAST focal point", () => {
        const area = { width: 300, height: 300, x: 0, y: 0 };
        const crop = { width: 100, height: 100 };
        // focal: x=300-100=200, y=100; x=max(200-50,0)=150; 150+100=250 ok; y=max(100-50,0)=50
        expect(getCenteredPosition(crop, area, FocalPoint.NORTHEAST)).toEqual({ x: 150, y: 50 });
    });

    it("positions crop near bottom-left for SOUTHWEST focal point", () => {
        const area = { width: 300, height: 300, x: 0, y: 0 };
        const crop = { width: 100, height: 100 };
        // focal: x=100, y=300-100=200; x=max(100-50,0)=50; y=max(200-50,0)=150; 150+100=250 ok
        expect(getCenteredPosition(crop, area, FocalPoint.SOUTHWEST)).toEqual({ x: 50, y: 150 });
    });

    it("returns area offset when crop equals area size", () => {
        const area = { width: 100, height: 100, x: 5, y: 8 };
        const crop = { width: 100, height: 100 };
        expect(getCenteredPosition(crop, area, FocalPoint.CENTER)).toEqual({ x: 5, y: 8 });
    });
});

describe("getSupportedMimeType", () => {
    it("returns matching mime type when accept header includes it", () => {
        expect(getSupportedMimeType(["image/webp", "image/jpeg"], "image/webp")).toBe("image/webp");
    });

    it("returns undefined when accept header does not include a supported type", () => {
        expect(getSupportedMimeType(["image/webp"], "image/jpeg")).toBeUndefined();
    });

    it("returns undefined when accept is empty", () => {
        expect(getSupportedMimeType(["image/webp", "image/jpeg"], "")).toBeUndefined();
    });

    it("returns undefined when no option matches the accept header", () => {
        expect(getSupportedMimeType(["image/webp"], "image/jpeg, image/png")).toBeUndefined();
    });

    it("picks the best match from a comma-separated accept header", () => {
        const result = getSupportedMimeType(["image/webp", "image/jpeg"], "image/jpeg, image/webp");
        expect(["image/jpeg", "image/webp"]).toContain(result);
    });
});
