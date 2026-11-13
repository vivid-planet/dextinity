import { DatePicker, type DatePickerProps, Field } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface DateFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        FieldAdapterBoxFieldProps,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<DatePickerProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"> {
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
    { name, onFocus, actions, ...props }: DateFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const [fieldProps, datePickerProps] = splitFieldProps(controlProps, boxFieldPropKeys);
    const { field, validationProps, ref, setValue } = useFieldAdapter<TFieldValues, TName, HTMLInputElement>({ name, ...options }, forwardedRef);
    const value = toDateValue(field.value);

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
            <DatePicker {...datePickerProps} ref={ref} name={field.name} value={value} onChange={setValue} />
        </Field>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: DateFieldProps<TFieldValues, TName> & RefAttributes<HTMLInputElement>,
) => ReactNode;
