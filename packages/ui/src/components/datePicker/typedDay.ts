import { formatDate, formatTime, type IsoDate, isWithin, parseDate } from "./dateValues";

/**
 * The texts that say why typed text can't be used as a day or time. Part of the date pickers' labels.
 */
export interface DateInputErrorLabels {
    /** Shown for typed text that isn't a day, with an example day in the expected format. */
    invalidDate: (example: string) => string;
    /** Shown for a typed day before `min` or after `max`, with the formatted limits that are set. */
    dateOutOfRange: (min: string | undefined, max: string | undefined) => string;
    /** Shown for typed text that isn't a time of day, with an example time in the expected format. */
    invalidTime: (example: string) => string;
}

export const defaultDateInputErrorLabels: DateInputErrorLabels = {
    invalidDate: (example) => `Enter a date like ${example}.`,
    dateOutOfRange: (min, max) =>
        min != null && max != null ? `Choose a date from ${min} to ${max}.` : min != null ? `Choose ${min} or later.` : `Choose ${max} or earlier.`,
    invalidTime: (example) => `Enter a time like ${example}.`,
};

/**
 * The result of reading typed text: the day, `null` for empty text, or why it can't be used.
 */
export type TypedDay = { day: IsoDate | null; error?: undefined } | { day?: undefined; error: string };

/**
 * Reads a day typed in the locale's format and checks it against `min` and `max`.
 */
export function readTypedDay(
    text: string,
    { locale, min, max, labels }: { locale: string | undefined; min: IsoDate | undefined; max: IsoDate | undefined; labels: DateInputErrorLabels },
): TypedDay {
    if (text.trim() === "") {
        return { day: null };
    }
    const day = parseDate(text, locale);
    if (day == null) {
        return { error: labels.invalidDate(formatDate(`${new Date().getFullYear()}-12-24`, locale)) };
    }
    if (!isWithin(day, min, max)) {
        return {
            error: labels.dateOutOfRange(min != null ? formatDate(min, locale) : undefined, max != null ? formatDate(max, locale) : undefined),
        };
    }
    return { day };
}

/**
 * The message for typed text that isn't a time of day.
 */
export function invalidTimeMessage(locale: string | undefined, labels: DateInputErrorLabels) {
    return labels.invalidTime(formatTime({ hours: 14, minutes: 30 }, locale));
}
