import { addDays, type IsoDate } from "./dateValues";

/**
 * Where a day lies in a range: at the start, at the end, or strictly between them.
 */
export type DateRangePosition = "start" | "end" | "between";

type IsRangeDayDisabled = (date: IsoDate, position: DateRangePosition) => boolean;

/**
 * The first end of the range that `isDateDisabled` disables as that end, or `undefined` when both ends can be chosen.
 */
export function disabledRangeEnd(
    range: { start: IsoDate | null; end: IsoDate | null } | null,
    isDateDisabled: IsRangeDayDisabled | undefined,
): { date: IsoDate; position: "start" | "end" } | undefined {
    if (range?.start != null && isDateDisabled?.(range.start, "start") === true) {
        return { date: range.start, position: "start" };
    }
    if (range?.end != null && isDateDisabled?.(range.end, "end") === true) {
        return { date: range.end, position: "end" };
    }
    return undefined;
}

function disabledDayToward(anchor: IsoDate, direction: 1 | -1, isDateDisabled: IsRangeDayDisabled) {
    const isBeforeLimit = (day: IsoDate, limit: IsoDate) => (direction === 1 ? day < limit : day > limit);
    let lastCheckedDay = anchor;
    let disabledDay: IsoDate | undefined;
    return (limit: IsoDate): IsoDate | undefined => {
        while (disabledDay === undefined && isBeforeLimit(addDays(lastCheckedDay, direction), limit)) {
            lastCheckedDay = addDays(lastCheckedDay, direction);
            if (isDateDisabled(lastCheckedDay, "between")) {
                disabledDay = lastCheckedDay;
            }
        }
        return disabledDay !== undefined && isBeforeLimit(disabledDay, limit) ? disabledDay : undefined;
    };
}

/**
 * Finds the day closest to `anchor` that `isDateDisabled` disables as `"between"` and that lies strictly between `anchor` and a given day,
 * in either direction. Each day is checked at most once, outward from `anchor` and only as far as the farthest day asked about.
 */
export function disabledDayBetween(anchor: IsoDate, isDateDisabled: IsRangeDayDisabled): (day: IsoDate) => IsoDate | undefined {
    const disabledDayAfter = disabledDayToward(anchor, 1, isDateDisabled);
    const disabledDayBefore = disabledDayToward(anchor, -1, isDateDisabled);
    return (day) => (day > anchor ? disabledDayAfter(day) : disabledDayBefore(day));
}

/**
 * The first day of the range that `isDateDisabled` disables in its position: the start, the end, or the earliest day between them. It is
 * `undefined` when the range can be chosen.
 */
export function disabledRangeDay(
    range: { start: IsoDate | null; end: IsoDate | null } | null,
    isDateDisabled: IsRangeDayDisabled | undefined,
): { date: IsoDate; position: DateRangePosition } | undefined {
    const disabledEnd = disabledRangeEnd(range, isDateDisabled);
    if (disabledEnd != null || range?.start == null || range.end == null || range.end < range.start || isDateDisabled == null) {
        return disabledEnd;
    }
    const disabledDay = disabledDayBetween(range.start, isDateDisabled)(range.end);
    return disabledDay === undefined ? undefined : { date: disabledDay, position: "between" };
}
