import { format, parse } from "date-fns";

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
