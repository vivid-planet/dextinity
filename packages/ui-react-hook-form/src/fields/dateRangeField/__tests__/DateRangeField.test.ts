import { describe, expect, it } from "vitest";

import { isIncompleteDateRange, toDateRangeValue } from "../DateRangeField";

describe("toDateRangeValue", () => {
    it("maps an empty form value to no range", () => {
        expect(toDateRangeValue(undefined)).toBeNull();
        expect(toDateRangeValue("")).toBeNull();
    });

    it("keeps the ends and maps empty ones to null", () => {
        expect(toDateRangeValue({ start: "2026-11-06", end: "" })).toStrictEqual({ start: "2026-11-06", end: null });
        expect(toDateRangeValue({ start: "2026-11-06", end: "2026-11-12" })).toStrictEqual({ start: "2026-11-06", end: "2026-11-12" });
    });
});

describe("isIncompleteDateRange", () => {
    it("treats a range as empty for required until both ends are set", () => {
        expect(isIncompleteDateRange(null)).toBe(true);
        expect(isIncompleteDateRange({ start: "2026-11-06", end: null })).toBe(true);
        expect(isIncompleteDateRange({ start: "2026-11-06", end: "2026-11-12" })).toBe(false);
    });
});
