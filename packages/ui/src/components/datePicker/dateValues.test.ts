import { describe, expect, it } from "vitest";

import {
    addMonths,
    formatDate,
    formatTime,
    isIsoDate,
    joinDateTime,
    localeWeekStart,
    monthWeeks,
    parseDate,
    parseTime,
    splitDateTime,
    startOfWeek,
} from "./dateValues";

describe("isIsoDate", () => {
    it("accepts only valid calendar days as YYYY-MM-DD", () => {
        expect(isIsoDate("2026-11-06")).toBe(true);
        expect(isIsoDate("2024-02-29")).toBe(true);
        expect(isIsoDate("2026-02-29")).toBe(false);
        expect(isIsoDate("2026-11-6")).toBe(false);
        expect(isIsoDate("2026-11-06T00:00:00Z")).toBe(false);
        expect(isIsoDate(null)).toBe(false);
    });
});

describe("addMonths", () => {
    it("keeps the day or uses the last day of a shorter month", () => {
        expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
        expect(addMonths("2026-11-06", -11)).toBe("2025-12-06");
        expect(addMonths("2026-11-06", 12)).toBe("2027-11-06");
    });
});

describe("monthWeeks", () => {
    it("starts each week on the given day and leaves other months' days empty", () => {
        const weeks = monthWeeks("2026-11-15", 1);

        expect(weeks).toHaveLength(6);
        expect(weeks[0]).toStrictEqual([null, null, null, null, null, null, "2026-11-01"]);
        expect(weeks[4]).toStrictEqual(["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"]);
        expect(weeks[5][0]).toBe("2026-11-30");
        expect(weeks[5][1]).toBeNull();
        expect(monthWeeks("2026-11-15", 0)[0][0]).toBe("2026-11-01");
    });
});

describe("startOfWeek", () => {
    it("goes back to the week's first day", () => {
        expect(startOfWeek("2026-11-06", 1)).toBe("2026-11-02");
        expect(startOfWeek("2026-11-06", 0)).toBe("2026-11-01");
        expect(startOfWeek("2026-11-02", 1)).toBe("2026-11-02");
    });
});

describe("localeWeekStart", () => {
    it("follows the locale's first day of the week", () => {
        expect(localeWeekStart("de-AT")).toBe(1);
        expect(localeWeekStart("en-US")).toBe(0);
    });
});

describe("formatDate", () => {
    it("formats the day in the locale without shifting it by the time zone", () => {
        expect(formatDate("2026-11-06", "de-AT")).toBe("06.11.2026");
        expect(formatDate("2026-11-06", "en-US")).toBe("11/06/2026");
        expect(formatDate("not a date", "en-US")).toBe("");
    });
});

describe("parseDate", () => {
    it("reads the locale's order of day, month, and year", () => {
        expect(parseDate("6.11.2026", "de-AT")).toBe("2026-11-06");
        expect(parseDate("11/6/2026", "en-US")).toBe("2026-11-06");
        expect(parseDate("6/11/2026", "en-GB")).toBe("2026-11-06");
    });

    it("reads digits without separators, two-digit years, and a missing year", () => {
        expect(parseDate("06112026", "de-AT")).toBe("2026-11-06");
        expect(parseDate("061126", "de-AT", 2026)).toBe("2026-11-06");
        expect(parseDate("1.1.99", "de-AT", 2026)).toBe("1999-01-01");
        expect(parseDate("6.11", "de-AT", 2026)).toBe("2026-11-06");
    });

    it("always reads YYYY-MM-DD", () => {
        expect(parseDate("2026-11-06", "en-US")).toBe("2026-11-06");
    });

    it("rejects text that is not a valid day", () => {
        expect(parseDate("", "de-AT")).toBeNull();
        expect(parseDate("31.2.2026", "de-AT")).toBeNull();
        expect(parseDate("tomorrow", "de-AT")).toBeNull();
        expect(parseDate("1.2.3.4", "de-AT")).toBeNull();
        expect(parseDate("123.1.2026", "de-AT")).toBeNull();
    });
});

describe("parseTime", () => {
    it("reads 24-hour and 12-hour times with or without separators", () => {
        expect(parseTime("9:30")).toStrictEqual({ hours: 9, minutes: 30 });
        expect(parseTime("09.30")).toStrictEqual({ hours: 9, minutes: 30 });
        expect(parseTime("0930")).toStrictEqual({ hours: 9, minutes: 30 });
        expect(parseTime("930")).toStrictEqual({ hours: 9, minutes: 30 });
        expect(parseTime("17")).toStrictEqual({ hours: 17, minutes: 0 });
        expect(parseTime("9:30 PM")).toStrictEqual({ hours: 21, minutes: 30 });
        expect(parseTime("12 am")).toStrictEqual({ hours: 0, minutes: 0 });
    });

    it("rejects times that don't exist", () => {
        expect(parseTime("24:00")).toBeNull();
        expect(parseTime("9:60")).toBeNull();
        expect(parseTime("13 pm")).toBeNull();
        expect(parseTime("noon")).toBeNull();
    });
});

describe("formatTime", () => {
    it("uses the locale's clock", () => {
        expect(formatTime({ hours: 21, minutes: 5 }, "de-AT")).toBe("21:05");
        expect(formatTime({ hours: 21, minutes: 5 }, "en-US")).toBe("09:05 PM");
    });
});

describe("joinDateTime and splitDateTime", () => {
    it("round-trip a local day and time through an ISO date-time", () => {
        const value = joinDateTime("2026-11-06", { hours: 8, minutes: 30 });

        expect(value).toBe(new Date(2026, 10, 6, 8, 30).toISOString());
        expect(splitDateTime(value)).toStrictEqual({ date: "2026-11-06", time: { hours: 8, minutes: 30 } });
    });

    it("reads nothing from an empty or invalid value", () => {
        expect(splitDateTime(null)).toBeNull();
        expect(splitDateTime("")).toBeNull();
        expect(splitDateTime("soon")).toBeNull();
    });
});
