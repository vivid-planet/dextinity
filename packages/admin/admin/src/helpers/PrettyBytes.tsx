import type { ComponentProps } from "react";
import { FormattedNumber } from "react-intl";

type AvailableUnits = "byte" | "kilobyte" | "megabyte" | "gigabyte" | "terabyte" | "petabyte";
const availableUnits: AvailableUnits[] = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte", "petabyte"];

interface PrettyBytesProps extends Omit<ComponentProps<typeof FormattedNumber>, "style"> {
    value: number;
    unit?: AvailableUnits;
}

export const PrettyBytes = ({ value: bytes, unit: customUnit, maximumFractionDigits: customMaximumFractionDigits, ...props }: PrettyBytesProps) => {
    let exponent;
    if (customUnit) {
        exponent = availableUnits.findIndex((unit) => unit === customUnit);
    } else {
        // log to base 1024
        // => receive exponent of equation `1024 ** exponent = bytes`
        // => exponent determines unit
        exponent = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));
        // upper and lower bounds => exponent cannot be outside range of availableUnits
        exponent = Math.min(exponent, availableUnits.length - 1);
        exponent = Math.max(exponent, 0);
    }
    const unit = availableUnits[exponent];
    const size = bytes / 1024 ** exponent;

    return <FormattedNumber value={size} style="unit" unit={unit} maximumFractionDigits={customMaximumFractionDigits ?? 2} {...props} />;
};
