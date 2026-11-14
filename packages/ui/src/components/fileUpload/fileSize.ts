const units = ["kilobyte", "megabyte", "gigabyte"] as const;

/**
 * Formats a file size with the largest unit that keeps the number at 1 or more, e.g. `1.4 MB`.
 */
export function formatFileSize(bytes: number, locale?: Intl.LocalesArgument): string {
    if (bytes < 1000) {
        return `${new Intl.NumberFormat(locale).format(bytes)} B`;
    }
    let value = bytes / 1000;
    let unitIndex = 0;
    while (value >= 1000 && unitIndex < units.length - 1) {
        value /= 1000;
        unitIndex += 1;
    }
    return new Intl.NumberFormat(locale, { style: "unit", unit: units[unitIndex], unitDisplay: "short", maximumFractionDigits: 1 }).format(value);
}
