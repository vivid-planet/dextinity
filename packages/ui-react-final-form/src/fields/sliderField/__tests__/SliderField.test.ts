import { describe, expect, it } from "vitest";

import { toSliderValue } from "../SliderField";

describe("toSliderValue", () => {
    it("rests at min without a numeric value", () => {
        expect(toSliderValue(undefined)).toBe(0);
        expect(toSliderValue("", 10)).toBe(10);
        expect(toSliderValue(Number.NaN, 5)).toBe(5);
    });

    it("keeps a number", () => {
        expect(toSliderValue(42, 10)).toBe(42);
    });
});
