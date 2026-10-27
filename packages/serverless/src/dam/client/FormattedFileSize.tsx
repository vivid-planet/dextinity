import { FormattedNumber } from "react-intl";

const units = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

export function FormattedFileSize({ bytes }: { bytes: number }) {
    const exponent = bytes > 0 ? Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1) : 0;
    return <FormattedNumber value={bytes / 1024 ** exponent} style="unit" unit={units[exponent]} unitDisplay="short" maximumFractionDigits={1} />;
}
