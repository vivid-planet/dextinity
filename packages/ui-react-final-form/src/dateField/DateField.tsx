import { DatePicker, type DatePickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface DateFieldProps<FieldValue = string | null>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, string | null>,
        Omit<DatePickerProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string | null>;
}

export function toDateValue(value: unknown): string | null {
    return typeof value === "string" && value !== "" ? value : null;
}

/**
 * A `DatePicker` connected to a React Final Form field: a day as `YYYY-MM-DD`, or `null` for none. Shows the field's error once it was
 * touched or the form was submitted.
 */
export const DateField = forwardRef(function DateField<FieldValue = string | null>(
    { name, actions, onFocus, ...props }: DateFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, datePickerProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, string | null, HTMLInputElement>(name, options, forwardedRef);
    const value = toDateValue(input.value);

    return (
        <DatePicker
            {...datePickerProps}
            {...validationProps}
            ref={ref}
            name={input.name}
            value={value}
            required={options.required}
            actions={renderActions(actions, value, input.onChange)}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <FieldValue = string | null>(props: DateFieldProps<FieldValue> & RefAttributes<HTMLInputElement>) => ReactNode;
