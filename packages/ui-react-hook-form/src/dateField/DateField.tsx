import { DatePicker, type DatePickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface DateFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<DatePickerProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string | null>;
}

export function toDateValue(value: unknown): string | null {
    return typeof value === "string" && value !== "" ? value : null;
}

/**
 * A `DatePicker` connected to a React Hook Form field: a day as `YYYY-MM-DD`, or `null` for none. Shows the field's error once it was
 * touched or the form was submitted.
 */
export const DateField = forwardRef(function DateField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, actions, ...props }: DateFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, datePickerProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLInputElement>({ name, ...options }, forwardedRef);
    const value = toDateValue(field.value);

    return (
        <DatePicker
            {...datePickerProps}
            {...validationProps}
            ref={ref}
            name={field.name}
            value={value}
            required={options.required}
            actions={renderActions(actions, value, field.onChange)}
            onChange={field.onChange}
            onBlur={field.onBlur}
        />
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: DateFieldProps<TFieldValues, TName> & RefAttributes<HTMLInputElement>,
) => ReactNode;
