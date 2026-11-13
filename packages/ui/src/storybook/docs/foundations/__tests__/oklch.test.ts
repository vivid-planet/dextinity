import { describe, expect, it } from "vitest";

import {
    formatOklch,
    hslToSrgb,
    isInDisplayP3Gamut,
    isInSrgbGamut,
    maxSrgbChroma,
    oklchToSrgb,
    parseOklch,
    relativeLuminance,
    srgbContrast,
    srgbToOklchLightness,
    toHex,
} from "../oklch";

describe("oklchToSrgb", () => {
    it.each([
        [{ lightness: 0, chroma: 0, hue: 0 }, "#000000"],
        [{ lightness: 1, chroma: 0, hue: 0 }, "#FFFFFF"],
        [{ lightness: 0.627955, chroma: 0.257683, hue: 29.2339 }, "#FF0000"],
        [{ lightness: 0.519752, chroma: 0.176858, hue: 142.495 }, "#008000"],
        [{ lightness: 0.452014, chroma: 0.313214, hue: 264.052 }, "#0000FF"],
    ])("converts %o to %s", (color, hex) => {
        expect(toHex(oklchToSrgb(color))).toBe(hex);
    });

    it("clips a color outside sRGB", () => {
        const rgb = oklchToSrgb({ lightness: 0.6, chroma: 0.37, hue: 145 });
        expect(rgb.every((channel) => channel >= 0 && channel <= 1)).toBe(true);
    });
});

describe("isInSrgbGamut", () => {
    it("accepts grays and the default accent", () => {
        expect(isInSrgbGamut({ lightness: 0.5, chroma: 0, hue: 0 })).toBe(true);
        expect(isInSrgbGamut({ lightness: 0.52, chroma: 0.255, hue: 275 })).toBe(true);
    });

    it("rejects high chroma near white and black", () => {
        expect(isInSrgbGamut({ lightness: 0.97, chroma: 0.2, hue: 275 })).toBe(false);
        expect(isInSrgbGamut({ lightness: 0.1, chroma: 0.2, hue: 145 })).toBe(false);
    });
});

describe("isInDisplayP3Gamut", () => {
    it("holds colors too colorful for sRGB", () => {
        const color = { lightness: 0.6, chroma: 0.22, hue: 145 };
        expect(isInSrgbGamut(color)).toBe(false);
        expect(isInDisplayP3Gamut(color)).toBe(true);
    });

    it("has limits too", () => {
        expect(isInDisplayP3Gamut({ lightness: 0.6, chroma: 0.37, hue: 145 })).toBe(false);
    });
});

describe("maxSrgbChroma", () => {
    it("finds the edge of sRGB", () => {
        const limit = maxSrgbChroma(0.6, 145);
        expect(isInSrgbGamut({ lightness: 0.6, chroma: limit, hue: 145 })).toBe(true);
        expect(isInSrgbGamut({ lightness: 0.6, chroma: limit + 0.005, hue: 145 })).toBe(false);
    });

    it("is 0 for white", () => {
        expect(maxSrgbChroma(1, 275)).toBeCloseTo(0, 3);
    });
});

describe("srgbToOklchLightness", () => {
    it("measures how light HSL colors of the same lightness look", () => {
        const yellow = srgbToOklchLightness(hslToSrgb(60, 85, 50));
        const blue = srgbToOklchLightness(hslToSrgb(220, 85, 50));
        expect(yellow).toBeGreaterThan(blue + 0.3);
    });

    it("round-trips the lightness of an OKLCH color", () => {
        expect(srgbToOklchLightness(oklchToSrgb({ lightness: 0.66, chroma: 0.1, hue: 200 }))).toBeCloseTo(0.66, 3);
    });
});

describe("hslToSrgb", () => {
    it.each([
        [0, 100, 50, "#FF0000"],
        [120, 100, 25, "#008000"],
        [240, 100, 50, "#0000FF"],
        [0, 0, 50, "#808080"],
    ])("converts hsl(%s %s%% %s%%) to %s", (hue, saturation, lightness, hex) => {
        expect(toHex(hslToSrgb(hue, saturation, lightness))).toBe(hex);
    });
});

describe("relativeLuminance", () => {
    it("is 0 for black, 1 for white, and weighs green most", () => {
        expect(relativeLuminance([0, 0, 0])).toBe(0);
        expect(relativeLuminance([1, 1, 1])).toBeCloseTo(1, 6);
        expect(relativeLuminance([0, 1, 0])).toBeGreaterThan(relativeLuminance([1, 0, 0]));
    });
});

describe("srgbContrast", () => {
    it("is 21 : 1 for black on white, in either order", () => {
        expect(srgbContrast([0, 0, 0], [1, 1, 1])).toBeCloseTo(21, 5);
        expect(srgbContrast([1, 1, 1], [0, 0, 0])).toBeCloseTo(21, 5);
    });

    it("matches the WCAG figure for #767676 on white", () => {
        expect(srgbContrast(hslToSrgb(0, 0, 46.27), [1, 1, 1])).toBeCloseTo(4.54, 1);
    });

    it("gives white text enough contrast on the default light accent", () => {
        expect(srgbContrast(oklchToSrgb({ lightness: 0.52, chroma: 0.255, hue: 275 }), [1, 1, 1])).toBeGreaterThan(4.5);
    });
});

describe("parseOklch", () => {
    it("reads computed values with percent lightness, none hue, and alpha", () => {
        expect(parseOklch("oklch(0.52 0.255 275)")).toEqual({ lightness: 0.52, chroma: 0.255, hue: 275, alpha: 1 });
        expect(parseOklch("oklch(97% 0 none / 0.5)")).toEqual({ lightness: 0.97, chroma: 0, hue: 0, alpha: 0.5 });
    });

    it("returns null for other colors", () => {
        expect(parseOklch("rgb(0, 0, 0)")).toBeNull();
    });
});

describe("formatOklch", () => {
    it("rounds for reading", () => {
        expect(formatOklch({ lightness: 0.6234, chroma: 0.19123, hue: 274.6 })).toBe("oklch(0.62 0.191 275)");
    });
});
