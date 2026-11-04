import { describe, expect, it } from "vitest";

import { getDateValue, getIsoDateString, isValidDate } from "../utils";

describe("getDateValue", () => {
    it("should return null for null input", () => {
        expect(getDateValue(null)).toBeNull();
    });

    it("should return null for undefined input", () => {
        expect(getDateValue(undefined)).toBeNull();
    });

    it("should return null for empty string", () => {
        expect(getDateValue("")).toBeNull();
    });

    it("should return a Date for a valid ISO date string", () => {
        const result = getDateValue("2023-06-15");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2023);
        expect(result?.getMonth()).toBe(5); // Month is 0-indexed -> June = 5
        expect(result?.getDate()).toBe(15);
    });

    it("should throw for an invalid date string", () => {
        expect(() => getDateValue("not-a-date")).toThrow("Invalid date value: not-a-date");
    });
});

describe("getIsoDateString", () => {
    it("should format a date as yyyy-MM-dd", () => {
        const date = new Date(2023, 5, 15); // June 15, 2023
        expect(getIsoDateString(date)).toBe("2023-06-15");
    });

    it("should zero-pad month and day", () => {
        const date = new Date(2023, 0, 5); // January 5, 2023
        expect(getIsoDateString(date)).toBe("2023-01-05");
    });
});

describe("isValidDate", () => {
    it("should return true for a valid date", () => {
        expect(isValidDate(new Date("2023-06-15"))).toBe(true);
    });

    it("should return false for an invalid date", () => {
        expect(isValidDate(new Date("not-a-date"))).toBe(false);
    });
});
