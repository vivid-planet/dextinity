import { describe, expect, it } from "vitest";

import { createTheme } from "./createTheme.js";
import { defaultTheme } from "./defaultTheme.js";
import { getDefaultFromResponsiveValue, getResponsiveOverrides } from "./responsiveValue.js";

describe("createTheme text", () => {
    it("includes default text values when no overrides given", () => {
        const theme = createTheme();
        expect(theme.text.fontFamily).toBe("Arial, sans-serif");
        expect(theme.text.fontSize).toBe("16px");
        expect(theme.text.lineHeight).toBe("20px");
        expect(theme.text.bottomSpacing).toBe("16px");
    });

    it("shallow-merges text overrides with defaults", () => {
        const theme = createTheme({ text: { fontFamily: "Georgia, serif", fontSize: "18px" } });
        expect(theme.text.fontFamily).toBe("Georgia, serif");
        expect(theme.text.fontSize).toBe("18px");
        expect(theme.text.lineHeight).toBe("20px");
        expect(theme.text.bottomSpacing).toBe("16px");
    });

    it("passes through variant definitions", () => {
        const theme = createTheme({
            text: {
                variants: {
                    heading: { fontSize: { default: "32px", mobile: "24px" } },
                },
            },
        });
        expect(theme.text.variants).toBeDefined();
        expect(theme.text.variants?.heading).toEqual({ fontSize: { default: "32px", mobile: "24px" } });
    });

    it("does not set defaultVariant or variants by default", () => {
        const theme = createTheme();
        expect(theme.text.defaultVariant).toBeUndefined();
        expect(theme.text.variants).toBeUndefined();
    });
});

describe("createTheme list", () => {
    it("shallow-merges list overrides with defaults", () => {
        const theme = createTheme({ list: { indent: 24 } });
        expect(theme.list.indent).toBe(24);
        expect(theme.list.markerGap).toBe(defaultTheme.list.markerGap);
        expect(theme.list.itemSpacing).toBe(defaultTheme.list.itemSpacing);
    });
});

describe("createTheme contentIndentation", () => {
    it("has default contentIndentation with responsive mobile value", () => {
        const theme = createTheme();
        expect(getDefaultFromResponsiveValue(theme.sizes.contentIndentation)).toBe(32);
        expect(getResponsiveOverrides(theme.sizes.contentIndentation)).toContainEqual({ breakpointKey: "mobile", value: 16 });
    });

    it("allows overriding contentIndentation with a plain number", () => {
        const theme = createTheme({ sizes: { contentIndentation: 30 } });
        expect(getDefaultFromResponsiveValue(theme.sizes.contentIndentation)).toBe(30);
        expect(getResponsiveOverrides(theme.sizes.contentIndentation)).toEqual([]);
    });

    it("allows overriding contentIndentation with an object", () => {
        const theme = createTheme({ sizes: { contentIndentation: { default: 30, mobile: 15 } } });
        expect(getDefaultFromResponsiveValue(theme.sizes.contentIndentation)).toBe(30);
        expect(getResponsiveOverrides(theme.sizes.contentIndentation)).toContainEqual({ breakpointKey: "mobile", value: 15 });
    });
});
