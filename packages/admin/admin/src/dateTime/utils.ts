import { format, parse, parseISO } from "date-fns";

export const getDateValue = (value: string | null | undefined): Date | null => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date value: ${value}`);
    }

    return date;
};

export const getIsoDateString = (date: Date) => {
    return format(date, "yyyy-MM-dd");
};

export const isValidDate = (date: Date) => {
    return !isNaN(date.getTime());
};

export const getTimeStringFromDate = (date: Date) => {
    return format(date, "HH:mm");
};

/**
 * Parses a 24-hour time string (`HH:mm`) into a `Date`. Returns `null` for empty or malformed
 * input so that a bad value renders as empty instead of throwing during render.
 */
export const getDateFromTimeString = (value: string | null | undefined): Date | null => {
    if (!value) {
        return null;
    }

    const parsedDate = parse(value, "HH:mm", new Date());

    if (!isValidDate(parsedDate)) {
        return null;
    }

    return parsedDate;
};

const isoDateLength = "YYYY-MM-DD".length;
const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
const isoTimePattern = /^(\d{2}:\d{2})(?::\d{2})?$/;

/**
 * Parses an ISO 8601 date string (`YYYY-MM-DD`, an optional time part is ignored) into a `Date`.
 * Returns `null` for anything else so callers can fall back to other formats.
 */
export const getDateFromIsoDateString = (value: string): Date | null => {
    const isoDateTime = value.trim();

    if (!isoDateTimePattern.test(isoDateTime)) {
        return null;
    }

    const parsedDate = parse(isoDateTime.slice(0, isoDateLength), "yyyy-MM-dd", new Date());

    if (!isValidDate(parsedDate)) {
        return null;
    }

    return parsedDate;
};

/**
 * Parses an ISO 8601 date and time string (`YYYY-MM-DDTHH:mm`, a missing time defaults to midnight) into a `Date`.
 * Returns `null` for anything else so callers can fall back to other formats.
 */
export const getDateFromIsoDateTimeString = (value: string): Date | null => {
    const isoDateTime = value.trim();

    if (!isoDateTimePattern.test(isoDateTime)) {
        return null;
    }

    const parsedDate = parseISO(isoDateTime.replace(" ", "T"));

    if (!isValidDate(parsedDate)) {
        return null;
    }

    return parsedDate;
};

/**
 * Parses a 24-hour time string (`HH:mm`, seconds are ignored) into a `Date`.
 * Returns `null` for anything else so callers can fall back to other formats.
 */
export const getDateFromIsoTimeString = (value: string): Date | null => {
    const isoTime = value.trim().match(isoTimePattern)?.[1];

    if (!isoTime) {
        return null;
    }

    return getDateFromTimeString(isoTime);
};
