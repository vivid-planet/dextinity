import { describe, expect, it, vi } from "vitest";

import { type DateRangePosition, disabledDayBetween, disabledRangeDay } from "../dateRange";

const isWeekend = (date: string) => [0, 6].includes(new Date(date).getUTCDay());
const startsMondayEndsFriday = (date: string, position: DateRangePosition) =>
    position !== "between" && new Date(date).getUTCDay() !== (position === "start" ? 1 : 5);

describe("disabledRangeDay", () => {
    it("checks the start and the end each with the rule of its position", () => {
        expect(disabledRangeDay({ start: "2026-11-09", end: "2026-11-13" }, startsMondayEndsFriday)).toBeUndefined();
        expect(disabledRangeDay({ start: "2026-11-13", end: "2026-11-20" }, startsMondayEndsFriday)).toEqual({
            date: "2026-11-13",
            position: "start",
        });
        expect(disabledRangeDay({ start: "2026-11-09", end: "2026-11-16" }, startsMondayEndsFriday)).toEqual({ date: "2026-11-16", position: "end" });
    });

    it("returns the earliest day between the ends that the rule disables as between", () => {
        expect(disabledRangeDay({ start: "2026-11-09", end: "2026-11-20" }, isWeekend)).toEqual({ date: "2026-11-14", position: "between" });
        expect(disabledRangeDay({ start: "2026-11-09", end: "2026-11-20" }, startsMondayEndsFriday)).toBeUndefined();
    });

    it("finds no day between the ends when the end is before the start", () => {
        expect(disabledRangeDay({ start: "2026-11-20", end: "2026-11-09" }, isWeekend)).toBeUndefined();
    });
});

describe("disabledDayBetween", () => {
    it("finds the disabled day closest to the anchor in both directions, without the given day", () => {
        const disabledDayBetweenAnchorAnd = disabledDayBetween("2026-11-11", isWeekend);
        expect(disabledDayBetweenAnchorAnd("2026-11-14")).toBeUndefined();
        expect(disabledDayBetweenAnchorAnd("2026-11-30")).toBe("2026-11-14");
        expect(disabledDayBetweenAnchorAnd("2026-11-08")).toBeUndefined();
        expect(disabledDayBetweenAnchorAnd("2026-11-01")).toBe("2026-11-08");
    });

    it("checks each day only once for all days asked about", () => {
        const isDateDisabled = vi.fn(() => false);
        const disabledDayBetweenAnchorAnd = disabledDayBetween("2026-11-11", isDateDisabled);
        for (let day = 1; day <= 30; day++) {
            disabledDayBetweenAnchorAnd(`2026-11-${String(day).padStart(2, "0")}`);
        }
        expect(isDateDisabled).toHaveBeenCalledTimes(27);
    });
});
