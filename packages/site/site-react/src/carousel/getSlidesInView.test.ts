import { describe, expect, it } from "vitest";

import { getSlidesInView } from "./getSlidesInView";

const createSlides = ({ count, width, gap }: { count: number; width: number; gap: number }) =>
    Array.from({ length: count }, (_, index) => ({ start: index * (width + gap), end: index * (width + gap) + width }));

describe("getSlidesInView", () => {
    it("returns the slide of the snap with one slide per view", () => {
        const slides = createSlides({ count: 5, width: 600, gap: 0 });

        expect(getSlidesInView({ slides, viewportSize: 600, scrollProgress: 0 })).toEqual([0]);
        expect(getSlidesInView({ slides, viewportSize: 600, scrollProgress: 0.5 })).toEqual([2]);
        expect(getSlidesInView({ slides, viewportSize: 600, scrollProgress: 1 })).toEqual([4]);
    });

    it("returns all fully visible slides with several slides per view", () => {
        const slides = createSlides({ count: 4, width: 300, gap: 20 });

        expect(getSlidesInView({ slides, viewportSize: 940, scrollProgress: 0 })).toEqual([0, 1, 2]);
        expect(getSlidesInView({ slides, viewportSize: 940, scrollProgress: 1 })).toEqual([1, 2, 3]);
    });

    it("excludes slides that only peek into the view", () => {
        const slides = createSlides({ count: 4, width: 300, gap: 20 });

        expect(getSlidesInView({ slides, viewportSize: 380, scrollProgress: 0 })).toEqual([0]);
    });

    it("returns the slides of a centered snap", () => {
        const slides = createSlides({ count: 5, width: 300, gap: 0 });

        // With `align: "center"`, the middle snap centers the third slide in a viewport for two slides.
        expect(getSlidesInView({ slides, viewportSize: 600, scrollProgress: 0.5 })).toEqual([2]);
    });

    it("tolerates offsets rounded to whole pixels", () => {
        const slides = [
            { start: 0, end: 313 },
            { start: 333, end: 646 },
        ];

        expect(getSlidesInView({ slides, viewportSize: 645.5, scrollProgress: 0 })).toEqual([0, 1]);
    });

    it("returns the slide with the largest visible part when no slide fits into the viewport", () => {
        const slides = createSlides({ count: 3, width: 800, gap: 0 });

        expect(getSlidesInView({ slides, viewportSize: 600, scrollProgress: 0 })).toEqual([0]);
        expect(getSlidesInView({ slides, viewportSize: 600, scrollProgress: 0.5 })).toEqual([1]);
        expect(getSlidesInView({ slides, viewportSize: 600, scrollProgress: 1 })).toEqual([2]);
    });

    it("returns all slides when they fit into the viewport", () => {
        const slides = createSlides({ count: 3, width: 200, gap: 20 });

        expect(getSlidesInView({ slides, viewportSize: 1000, scrollProgress: 0 })).toEqual([0, 1, 2]);
    });

    it("returns no slides when there are none", () => {
        expect(getSlidesInView({ slides: [], viewportSize: 600, scrollProgress: 0 })).toEqual([]);
    });
});
