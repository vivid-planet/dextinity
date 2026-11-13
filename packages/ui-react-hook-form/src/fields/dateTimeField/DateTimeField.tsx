import { DateTimePicker, type DateTimePickerProps, Field } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface DateTimeFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        FieldAdapterBoxFieldProps,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<DateTimePickerProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string | null>;
}

export function toDateTimeValue(value: unknown): string | null {
    return typeof value === "string" && value !== "" ? value : null;
}

/**
 * A `DateTimePicker` connected to a React Hook Form field: an instant as an ISO 8601 date-time, or `null` for none. Shows the field's error once it was
 * touched or the form was submitted.
 */
export const DateTimeField = forwardRef(function DateTimeField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, onFocus, actions, ...props }: DateTimeFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const [fieldProps, datePickerProps] = splitFieldProps(controlProps, boxFieldPropKeys);
    const { field, validationProps, ref, setValue } = useFieldAdapter<TFieldValues, TName, HTMLInputElement>({ name, ...options }, forwardedRef);
    const value = toDateTimeValue(field.value);

    return (
        <Field
            {...fieldProps}
            {...validationProps}
            required={options.required}
            actions={renderActions(actions, value, setValue)}
            onBlur={(event) => {
                if (leavesField(event)) {
                    field.onBlur();
                }
            }}
            onFocus={onFocus}
        >
            <DateTimePicker {...datePickerProps} ref={ref} name={field.name} value={value} onChange={setValue} />
        </Field>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: DateTimeFieldProps<TFieldValues, TName> & RefAttributes<HTMLInputElement>,
) => ReactNode;
