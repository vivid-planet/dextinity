import { DateTimePicker, type DateTimePickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface DateTimeFieldProps<FieldValue = string | null>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, string | null>,
        Omit<DateTimePickerProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string | null>;
}

export function toDateTimeValue(value: unknown): string | null {
    return typeof value === "string" && value !== "" ? value : null;
}

/**
 * A `DateTimePicker` connected to a React Final Form field: an instant as an ISO 8601 date-time, or `null` for none. Shows the field's error once it was
 * touched or the form was submitted.
 */
export const DateTimeField = memo(
    forwardRef(function DateTimeField<FieldValue = string | null>(
        { name, actions, onFocus, ...props }: DateTimeFieldProps<FieldValue>,
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
        const value = toDateTimeValue(input.value);

        return (
            <DateTimePicker
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
    }),
) as <FieldValue = string | null>(props: DateTimeFieldProps<FieldValue> & RefAttributes<HTMLInputElement>) => ReactNode;
