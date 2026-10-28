import { describe, expect, it } from "vitest";

import { getSlidesInView } from "./getSlidesInView";

const createSlides = ({ count, width, gap, offset = 0 }: { count: number; width: number; gap: number; offset?: number }) =>
    Array.from({ length: count }, (_, index) => ({ start: offset + index * (width + gap), end: offset + index * (width + gap) + width }));

describe("getSlidesInView", () => {
    it("returns the slide in view with one slide per view", () => {
        expect(getSlidesInView({ slides: createSlides({ count: 5, width: 600, gap: 0, offset: -1200 }), viewportSize: 600 })).toEqual([2]);
    });

    it("returns all fully visible slides with several slides per view", () => {
        expect(getSlidesInView({ slides: createSlides({ count: 4, width: 300, gap: 20 }), viewportSize: 940 })).toEqual([0, 1, 2]);
        expect(getSlidesInView({ slides: createSlides({ count: 4, width: 300, gap: 20, offset: -320 }), viewportSize: 940 })).toEqual([1, 2, 3]);
    });

    it("excludes slides that only peek into the view", () => {
        expect(getSlidesInView({ slides: createSlides({ count: 4, width: 300, gap: 20 }), viewportSize: 380 })).toEqual([0]);
    });

    it("returns the centered slide when its neighbors are cut off", () => {
        // The first of five 300px slides centered in a 600px viewport.
        expect(getSlidesInView({ slides: createSlides({ count: 5, width: 300, gap: 0, offset: 150 }), viewportSize: 600 })).toEqual([0]);
    });

    it("tolerates rectangles that are off by fractions of a pixel", () => {
        const slides = [
            { start: -0.4, end: 313.3 },
            { start: 333.3, end: 646.2 },
        ];

        expect(getSlidesInView({ slides, viewportSize: 645.5 })).toEqual([0, 1]);
    });

    it("returns the slide with the largest visible part when no slide fits into the viewport", () => {
        expect(getSlidesInView({ slides: createSlides({ count: 3, width: 800, gap: 0 }), viewportSize: 600 })).toEqual([0]);
        expect(getSlidesInView({ slides: createSlides({ count: 3, width: 800, gap: 0, offset: -900 }), viewportSize: 600 })).toEqual([1]);
    });

    it("returns all slides when they fit into the viewport", () => {
        expect(getSlidesInView({ slides: createSlides({ count: 3, width: 200, gap: 20 }), viewportSize: 1000 })).toEqual([0, 1, 2]);
    });

    it("returns no slides when there are none", () => {
        expect(getSlidesInView({ slides: [], viewportSize: 600 })).toEqual([]);
    });
});
