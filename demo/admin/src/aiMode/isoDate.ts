const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Whether the value is a date in the format YYYY-MM-DD that exists, e.g. not "2026-13-45" or "2026-02-30". */
export function isIsoDate(value: string) {
    const match = isoDatePattern.exec(value);
    if (!match) {
        return false;
    }
    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
