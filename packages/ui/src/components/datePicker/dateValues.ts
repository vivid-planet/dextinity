/**
 * A calendar day as `YYYY-MM-DD`, free of time and time zone, so it stays the same day everywhere.
 */
export type IsoDate = string;

interface DateParts {
    year: number;
    month: number;
    day: number;
}

/**
 * A time of day in hours (0–23) and minutes.
 */
export interface TimeOfDay {
    hours: number;
    minutes: number;
}

type DatePartType = "year" | "month" | "day";

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number, length = 2) {
    return String(value).padStart(length, "0");
}

function daysInMonth(year: number, month: number) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isValidParts({ year, month, day }: DateParts) {
    return year >= 1 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

function toUtcDate({ year, month, day }: DateParts) {
    const date = new Date(Date.UTC(2000, month - 1, day));
    date.setUTCFullYear(year);
    return date;
}

function fromUtcDate(date: Date): IsoDate {
    return toIsoDate({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
}

function toIsoDate({ year, month, day }: DateParts): IsoDate {
    return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/**
 * The parts of a `YYYY-MM-DD` value, or `null` when it is not a valid calendar day.
 */
function parseIsoDate(value: string | null | undefined): DateParts | null {
    const match = value?.match(isoDatePattern);
    if (!match) {
        return null;
    }
    const parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    return isValidParts(parts) ? parts : null;
}

function partsOf(date: IsoDate): DateParts {
    const parts = parseIsoDate(date);
    if (parts == null) {
        throw new Error(`Invalid date "${date}", expected YYYY-MM-DD`);
    }
    return parts;
}

/**
 * Whether the value is a valid `YYYY-MM-DD` calendar day.
 */
export function isIsoDate(value: unknown): value is IsoDate {
    return typeof value === "string" && parseIsoDate(value) != null;
}

export function addDays(date: IsoDate, days: number): IsoDate {
    const utcDate = toUtcDate(partsOf(date));
    utcDate.setUTCDate(utcDate.getUTCDate() + days);
    return fromUtcDate(utcDate);
}

/**
 * Moves by whole months, keeping the day where the target month has it and using its last day otherwise.
 */
export function addMonths(date: IsoDate, months: number): IsoDate {
    const { year, month, day } = partsOf(date);
    const monthIndex = year * 12 + (month - 1) + months;
    const targetYear = Math.floor(monthIndex / 12);
    const targetMonth = (monthIndex % 12) + 1;
    return toIsoDate({ year: targetYear, month: targetMonth, day: Math.min(day, daysInMonth(targetYear, targetMonth)) });
}

export function startOfMonth(date: IsoDate): IsoDate {
    return `${date.slice(0, 8)}01`;
}

export function endOfMonth(date: IsoDate): IsoDate {
    const { year, month } = partsOf(date);
    return toIsoDate({ year, month, day: daysInMonth(year, month) });
}

/**
 * The day of the week, 0 for Sunday to 6 for Saturday.
 */
function dayOfWeek(date: IsoDate): number {
    return toUtcDate(partsOf(date)).getUTCDay();
}

export function startOfWeek(date: IsoDate, weekStartsOn: number): IsoDate {
    return addDays(date, -((dayOfWeek(date) - weekStartsOn + 7) % 7));
}

export function endOfWeek(date: IsoDate, weekStartsOn: number): IsoDate {
    return addDays(startOfWeek(date, weekStartsOn), 6);
}

/**
 * Whether the day lies within `min` and `max`, both inclusive and optional.
 */
export function isWithin(date: IsoDate, min: IsoDate | undefined, max: IsoDate | undefined) {
    return (min == null || date >= min) && (max == null || date <= max);
}

export function clampDate(date: IsoDate, min: IsoDate | undefined, max: IsoDate | undefined): IsoDate {
    if (min != null && date < min) {
        return min;
    }
    if (max != null && date > max) {
        return max;
    }
    return date;
}

/**
 * The number of whole months from the month of `from` to the month of `to`, negative when `to` is earlier.
 */
export function monthsBetween(from: IsoDate, to: IsoDate): number {
    const start = partsOf(from);
    const end = partsOf(to);
    return (end.year - start.year) * 12 + (end.month - start.month);
}

/**
 * The years to choose from in the calendar: from the year of `min` to the year of `max`, or `yearsAround` years before and after
 * today's year where a limit is missing, always including the shown year.
 */
export function calendarYears(shown: IsoDate, min: IsoDate | undefined, max: IsoDate | undefined, today: IsoDate, yearsAround = 100): number[] {
    const shownYear = partsOf(shown).year;
    const todayYear = partsOf(today).year;
    const first = Math.min(min != null ? partsOf(min).year : Math.max(1, todayYear - yearsAround), shownYear);
    const last = Math.max(max != null ? partsOf(max).year : Math.min(9999, todayYear + yearsAround), shownYear);
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

/**
 * The weeks shown for a month: always six rows of seven days starting on `weekStartsOn`, with `null` for days of other months, so the
 * calendar keeps its height from month to month.
 */
export function monthWeeks(month: IsoDate, weekStartsOn: number): Array<Array<IsoDate | null>> {
    const first = startOfMonth(month);
    const monthPrefix = first.slice(0, 8);
    let day = startOfWeek(first, weekStartsOn);
    const weeks: Array<Array<IsoDate | null>> = [];
    for (let week = 0; week < 6; week++) {
        const days: Array<IsoDate | null> = [];
        for (let weekday = 0; weekday < 7; weekday++) {
            days.push(day.startsWith(monthPrefix) ? day : null);
            day = addDays(day, 1);
        }
        weeks.push(days);
    }
    return weeks;
}

/**
 * Today in the local time zone.
 */
export function today(now = new Date()): IsoDate {
    return toIsoDate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}

/**
 * The first day of the week in the locale, 0 for Sunday to 6 for Saturday. Falls back to Monday where the browser doesn't tell.
 */
export function localeWeekStart(locale: string | undefined): number {
    try {
        const intlLocale = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
            getWeekInfo?: () => { firstDay: number };
            weekInfo?: { firstDay: number };
        };
        const firstDay = (intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo)?.firstDay;
        return firstDay == null ? 1 : firstDay % 7;
    } catch {
        return 1;
    }
}

/**
 * Formats a day in the locale, `2-digit` day and month with a numeric year unless other options are given.
 */
export function formatDate(date: IsoDate, locale: string | undefined, options?: Intl.DateTimeFormatOptions): string {
    const parts = parseIsoDate(date);
    if (parts == null) {
        return "";
    }
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit", ...options, timeZone: "UTC" }).format(
        toUtcDate(parts),
    );
}

function datePartOrder(locale: string | undefined): DatePartType[] {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" })
        .formatToParts(new Date(Date.UTC(2026, 10, 30)))
        .map((part) => part.type)
        .filter((type): type is DatePartType => type === "year" || type === "month" || type === "day");
}

function expandYear(year: string, referenceYear: number) {
    if (year.length > 2) {
        return Number(year);
    }
    // A two-digit year means the one closest to the reference year, so "99" is 1999 and "30" is 2030 in 2026
    const century = Math.floor(referenceYear / 100) * 100;
    const candidates = [century - 100, century, century + 100].map((base) => base + Number(year));
    return candidates.reduce((closest, candidate) => (Math.abs(candidate - referenceYear) < Math.abs(closest - referenceYear) ? candidate : closest));
}

/**
 * Reads a day typed in the locale's order of day, month, and year, with any separators, e.g. `6.11.2026`, `6/11/26`, or `06112026` for
 * German. `YYYY-MM-DD` is always understood. Without a year, it is the reference year. Returns `null` for anything that is not a valid day.
 */
export function parseDate(text: string, locale: string | undefined, referenceYear = new Date().getFullYear()): IsoDate | null {
    const trimmed = text.trim();
    if (trimmed === "") {
        return null;
    }
    if (isoDatePattern.test(trimmed)) {
        return isIsoDate(trimmed) ? trimmed : null;
    }

    const order = datePartOrder(locale);
    let groups = trimmed.split(/\D+/).filter((group) => group !== "");
    if (groups.length === 1 && (groups[0].length === 6 || groups[0].length === 8)) {
        const digits = groups[0];
        const yearLength = digits.length - 4;
        groups = [];
        let offset = 0;
        for (const type of order) {
            const length = type === "year" ? yearLength : 2;
            groups.push(digits.slice(offset, offset + length));
            offset += length;
        }
    }

    const values: Partial<Record<DatePartType, string>> = {};
    if (groups.length === 3) {
        order.forEach((type, index) => (values[type] = groups[index]));
    } else if (groups.length === 2) {
        order.filter((type) => type !== "year").forEach((type, index) => (values[type] = groups[index]));
    } else {
        return null;
    }
    if (
        (values.day?.length ?? 0) > 2 ||
        (values.month?.length ?? 0) > 2 ||
        (values.year != null && values.year.length !== 2 && values.year.length !== 4)
    ) {
        return null;
    }

    const parts = {
        year: values.year == null ? referenceYear : expandYear(values.year, referenceYear),
        month: Number(values.month),
        day: Number(values.day),
    };
    return isValidParts(parts) ? toIsoDate(parts) : null;
}

/**
 * Formats a time of day in the locale, as hours and minutes with the locale's 12- or 24-hour clock.
 */
export function formatTime(time: TimeOfDay, locale: string | undefined): string {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(
        new Date(Date.UTC(2000, 0, 1, time.hours, time.minutes)),
    );
}

/**
 * Reads a typed time of day: `9:30`, `09.30`, `0930`, `9`, or with `am`/`pm`, e.g. `9:30 pm`. Returns `null` for anything else.
 */
export function parseTime(text: string): TimeOfDay | null {
    const match = text
        .trim()
        .toLowerCase()
        .match(/^(\d{1,2})(?:\s*[:.h]?\s*(\d{2}))?\s*([ap])?\.?\s*(?:m\.?)?$/);
    if (!match) {
        return null;
    }
    let hours = Number(match[1]);
    const minutes = match[2] == null ? 0 : Number(match[2]);
    const period = match[3];
    if (period != null) {
        if (hours < 1 || hours > 12) {
            return null;
        }
        hours = (hours % 12) + (period === "p" ? 12 : 0);
    }
    return hours <= 23 && minutes <= 59 ? { hours, minutes } : null;
}

/**
 * The local day and time of an ISO 8601 date-time, or `null` when it can't be read.
 */
export function splitDateTime(value: string | null | undefined): { date: IsoDate; time: TimeOfDay } | null {
    if (value == null || value === "") {
        return null;
    }
    const instant = new Date(value);
    if (Number.isNaN(instant.getTime())) {
        return null;
    }
    return { date: today(instant), time: { hours: instant.getHours(), minutes: instant.getMinutes() } };
}

/**
 * The instant of a local day and time, as an ISO 8601 date-time in UTC, e.g. `2026-11-06T08:30:00.000Z`.
 */
export function joinDateTime(date: IsoDate, time: TimeOfDay): string {
    const { year, month, day } = partsOf(date);
    const instant = new Date(2000, month - 1, day, time.hours, time.minutes);
    instant.setFullYear(year);
    return instant.toISOString();
}
