import { describe, expect, it } from "vitest";

import { contrastGrade, contrastRatio, parseColor } from "./contrast";

function parse(value: string) {
    const color = parseColor(value);
    if (!color) {
        throw new Error(`Unparsable color ${value}`);
    }
    return color;
}

const white = parse("rgb(255, 255, 255)");
const black = parse("rgb(0, 0, 0)");

describe("contrastRatio", () => {
    it("is 21 : 1 for black on white", () => {
        expect(contrastRatio(black, white, white)).toBeCloseTo(21, 1);
    });

    it("reads oklch, rgb, and color(srgb) alike", () => {
        expect(contrastRatio(parse("oklch(0 0 0)"), white, white)).toBeCloseTo(21, 1);
        expect(contrastRatio(parse("color(srgb 0 0 0)"), white, white)).toBeCloseTo(21, 1);
        expect(contrastRatio(parse("oklch(100% 0 none)"), black, black)).toBeCloseTo(21, 1);
    });

    it("lays a translucent background over the backdrop", () => {
        const translucentBlack = parse("oklch(0 0 0 / 0.5)");
        expect(contrastRatio(black, translucentBlack, white)).toBeLessThan(contrastRatio(black, white, white));
    });

    it("matches the draft's figure for the default text color on canvas", () => {
        expect(contrastRatio(parse("oklch(0.19 0.015 285)"), parse("oklch(0.984 0.003 285)"), white)).toBeCloseTo(17.7, 0);
    });
});

describe("parseColor", () => {
    it("returns null for values it cannot read", () => {
        expect(parseColor("linear-gradient(red, blue)")).toBeNull();
    });
});

describe("contrastGrade", () => {
    it.each([
        [7, "AAA"],
        [4.5, "AA"],
        [3, "AA large"],
        [2.9, "fail"],
    ] as const)("grades %s : 1 as %s", (ratio, grade) => {
        expect(contrastGrade(ratio)).toBe(grade);
    });
});
