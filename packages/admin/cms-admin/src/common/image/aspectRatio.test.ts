import { describe, expect, it } from "vitest";

import { formatAspectRatio, parseAspectRatio } from "./aspectRatio";

describe("parseAspectRatio", () => {
    it.each(["16x9", "16/9", "16:9"])("parses %s", (value) => {
        expect(parseAspectRatio(value)).toBeCloseTo(16 / 9);
    });

    it("passes a number through", () => {
        expect(parseAspectRatio(16 / 9)).toBeCloseTo(16 / 9);
    });

    it("reads a single value as a ratio to 1", () => {
        expect(parseAspectRatio("2")).toBe(2);
    });

    it("parses a portrait ratio", () => {
        expect(parseAspectRatio("1x2")).toBe(0.5);
    });

    it.each(["foo", "0x9", ""])("throws for %s", (value) => {
        expect(() => parseAspectRatio(value)).toThrow(`An error occurred while parsing the aspect ratio: ${value}`);
    });
});

describe("formatAspectRatio", () => {
    it.each(["16x9", "16/9", "16:9"])("renders %s as 16:9", (value) => {
        expect(formatAspectRatio(value)).toBe("16:9");
    });

    it("renders a single value as a ratio to 1", () => {
        expect(formatAspectRatio("2")).toBe("2:1");
    });

    it("shortens a number to two decimals", () => {
        expect(formatAspectRatio(16 / 9)).toBe("1.78:1");
    });
});
