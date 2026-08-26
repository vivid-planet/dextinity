import { describe, expect, it } from "vitest";

import { createBreakpoint } from "../../theme/createBreakpoint.js";
import type { ResponsiveValue } from "../../theme/responsiveValue.js";
import type { ThemeBreakpoints } from "../../theme/themeTypes.js";
import { generateResponsiveVariantCss, type ResponsiveVariantProperties } from "../responsiveCss.js";

const breakpoints: ThemeBreakpoints = { default: createBreakpoint(600), mobile: createBreakpoint(480) };
const mobileMediaQuery = "@media (max-width: 479px)";

const countOccurrences = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

const declarationsFor = (css: string, selector: string): string => {
    const start = css.indexOf(`${selector} {`);
    return start === -1 ? "" : css.slice(start, css.indexOf("}", start));
};

interface TestStyleMap {
    fontSize: string;
    fontWeight: string | number;
    color: string;
    height: number;
    bottomSpacing: string;
}

type TestVariantStyles = { [K in keyof TestStyleMap]?: ResponsiveValue<TestStyleMap[K]> };

const styleProperties: ResponsiveVariantProperties<TestVariantStyles> = [
    "fontSize",
    "fontWeight",
    "color",
    { themeKey: "height", cssProperties: ["height", "line-height"], unit: "px" },
];
const spacingProperties: ResponsiveVariantProperties<TestVariantStyles> = [{ themeKey: "bottomSpacing", cssProperties: "padding-bottom" }];

function generate(variants: Record<string, TestVariantStyles | undefined> | undefined): string {
    return generateResponsiveVariantCss<TestVariantStyles>({
        breakpoints,
        variants,
        groups: [
            { selector: (variantName) => `.test--${variantName}`, properties: styleProperties },
            { selector: (variantName) => `.test--withSpacing.test--${variantName}`, properties: spacingProperties },
        ],
    });
}

describe("generateResponsiveVariantCss", () => {
    it("returns an empty string when no variants are defined", () => {
        expect(generate(undefined)).toBe("");
    });

    it("emits no media query for a variant without responsive overrides", () => {
        expect(generate({ heading: { fontSize: "16px" } })).toBe("");
    });

    it("merges overrides at one breakpoint into a single media query, deriving the CSS property from the key", () => {
        const result = generate({ heading: { fontSize: { default: "24px", mobile: "20px" }, color: { default: "#000000", mobile: "#ffffff" } } });

        expect(countOccurrences(result, mobileMediaQuery)).toBe(1);
        expect(result).toContain("font-size: 20px !important");
        expect(result).toContain("color: #ffffff !important");
    });

    it("stringifies numeric values without a unit", () => {
        const result = generate({ heading: { fontWeight: { default: 400, mobile: 700 } } });

        expect(result).toContain("font-weight: 700 !important");
    });

    it("appends the unit and fans a single value out to multiple CSS properties", () => {
        const result = generate({ heading: { height: { default: 4, mobile: 2 } } });

        expect(result).toContain("height: 2px !important");
        expect(result).toContain("line-height: 2px !important");
    });

    it("does not emit the inline default value inside a media query", () => {
        const result = generate({ heading: { fontSize: { default: "24px", mobile: "20px" } } });

        expect(result).not.toContain("24px");
    });

    it("emits each group under its own selector", () => {
        const result = generate({ heading: { fontSize: { default: "24px", mobile: "20px" }, bottomSpacing: { default: "16px", mobile: "8px" } } });

        expect(result).toContain(".test--heading {");
        expect(result).toContain(".test--withSpacing.test--heading {");
        expect(result).toContain("padding-bottom: 8px !important");
    });

    it("keeps each variant's overrides within its own selector block", () => {
        const result = generate({
            heading: { fontSize: { default: "24px", mobile: "20px" } },
            body: { fontSize: { default: "16px", mobile: "14px" } },
        });

        expect(declarationsFor(result, ".test--heading")).toContain("font-size: 20px !important");
        expect(declarationsFor(result, ".test--heading")).not.toContain("14px");
        expect(declarationsFor(result, ".test--body")).toContain("font-size: 14px !important");
        expect(declarationsFor(result, ".test--body")).not.toContain("20px");
    });
});
