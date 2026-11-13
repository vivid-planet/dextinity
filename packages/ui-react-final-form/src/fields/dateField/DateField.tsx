import { DatePicker, type DatePickerProps, Field } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface DateFieldProps<FieldValue = string | null>
    extends
        FieldAdapterBaseProps,
        FieldAdapterBoxFieldProps,
        FinalFormFieldConfig<FieldValue, string | null>,
        Omit<DatePickerProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"> {
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
export const DateField = memo(
    forwardRef(function DateField<FieldValue = string | null>(
        { name, actions, onFocus, ...props }: DateFieldProps<FieldValue>,
        forwardedRef: ForwardedRef<HTMLInputElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, datePickerProps] = splitFieldProps(controlProps, boxFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, string | null, HTMLInputElement>(name, options, forwardedRef);
        const value = toDateValue(input.value);

        return (
            <Field
                {...fieldProps}
                {...validationProps}
                required={options.required}
                actions={renderActions(actions, value, input.onChange)}
                onBlur={(event) => {
                    if (leavesField(event)) {
                        onBlur();
                    }
                }}
                onFocus={(event) => {
                    onFieldFocus();
                    onFocus?.(event);
                }}
            >
                <DatePicker {...datePickerProps} ref={ref} name={input.name} value={value} onChange={input.onChange} />
            </Field>
        );
    }),
) as <FieldValue = string | null>(props: DateFieldProps<FieldValue> & RefAttributes<HTMLInputElement>) => ReactNode;
