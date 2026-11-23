import { format, isValid, parse } from "date-fns";

const isoDateFormat = "yyyy-MM-dd";

/**
 * Whether the value is a date in the format YYYY-MM-DD that exists, e.g. not "2026-13-45" or "2026-02-30". Formatted
 * again because `parse` also takes "2026-1-5", which the date picker's `new Date` parses in some browsers only.
 */
export function isIsoDate(value: string) {
    const date = parse(value, isoDateFormat, new Date());
    return isValid(date) && format(date, isoDateFormat) === value;
}
