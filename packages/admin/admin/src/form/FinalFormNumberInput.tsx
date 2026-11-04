import { InputBase, type InputBaseProps } from "@mui/material";
import { type ChangeEvent, type FocusEvent, useCallback, useEffect, useState } from "react";
import type { FieldRenderProps } from "react-final-form";
import { useIntl } from "react-intl";

import { ClearInputAdornment } from "../common/ClearInputAdornment";

export type FinalFormNumberInputProps = InputBaseProps & {
    decimals?: number;
};

type FinalFormNumberInputInternalProps = FieldRenderProps<number>;

/**
 * Final Form-compatible NumberInput component.
 *
 * @see {@link NumberField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export function FinalFormNumberInput({
    meta,
    input,
    innerRef,
    endAdornment,
    required,
    disabled,
    readOnly,
    decimals = 0,
    ...props
}: FinalFormNumberInputProps & FinalFormNumberInputInternalProps) {
    const intl = useIntl();

    const [formattedNumberValue, setFormattedNumberValue] = useState("");

    const getFormattedValue = useCallback(
        (value: number | undefined) => {
            const formattedValue =
                value !== undefined ? intl.formatNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "";
            return formattedValue;
        },
        [decimals, intl],
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setFormattedNumberValue(value);
    };

    const updateFormattedNumberValue = useCallback(
        (inputValue?: number) => {
            if (!inputValue && inputValue !== 0) {
                setFormattedNumberValue("");
            } else {
                setFormattedNumberValue(getFormattedValue(inputValue));
            }
        },
        [getFormattedValue],
    );

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        input.onBlur(event);
        const { value } = event.target;
        const numberParts = intl.formatNumberToParts(1111.111);
        const decimalSymbol = numberParts.find(({ type }) => type === "decimal")?.value;
        const thousandSeparatorSymbol = numberParts.find(({ type }) => type === "group")?.value;

        const numericValue = parseFloat(
            value
                .split(thousandSeparatorSymbol || "")
                .join("")
                .split(decimalSymbol || ".")
                .join("."),
        );

        const roundToDecimals = (numericValue: number, decimals: number) => {
            const factor = Math.pow(10, decimals);
            return Math.round(numericValue * factor) / factor;
        };

        const inputValue: number | undefined = isNaN(numericValue) ? undefined : roundToDecimals(numericValue, decimals);
        input.onChange(inputValue);

        if (input.value === inputValue) {
            updateFormattedNumberValue(inputValue);
        }
    };

    useEffect(() => {
        updateFormattedNumberValue(input.value);
    }, [updateFormattedNumberValue, input.value]);

    const clearable = !required && !disabled && !readOnly;

    return (
        <InputBase
            {...input}
            {...props}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            value={formattedNumberValue}
            onChange={handleChange}
            onBlur={handleBlur}
            endAdornment={
                (endAdornment || clearable) && (
                    <>
                        {clearable && typeof input.value === "number" && (
                            <ClearInputAdornment position="end" onClick={() => input.onChange(undefined)} />
                        )}
                        {endAdornment}
                    </>
                )
            }
        />
    );
}
