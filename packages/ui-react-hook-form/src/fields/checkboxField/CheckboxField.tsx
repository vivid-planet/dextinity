import { Checkbox, type CheckboxProps, Field } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface CheckboxFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        FieldAdapterFieldProps,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<
            CheckboxProps,
            "name" | "checked" | "onChange" | "onBlur" | "onFocus" | "required" | "defaultValue" | "defaultChecked" | "state" | "validationMessage"
        > {
    /** Makes the checkbox one of a group: the field holds the list of the checked boxes' values, and this box adds or removes its own. */
    value?: string;
}

export function isCheckboxChecked(fieldValue: unknown, value: string | undefined) {
    return value === undefined ? fieldValue === true : Array.isArray(fieldValue) && fieldValue.includes(value);
}

export function toggleCheckboxValue(fieldValue: unknown, value: string | undefined, checked: boolean): boolean | string[] {
    if (value === undefined) {
        return checked;
    }
    const values: string[] = Array.isArray(fieldValue) ? fieldValue.filter((item) => item !== value) : [];
    return checked ? [...values, value] : values;
}

/**
 * A `Checkbox` connected to a React Hook Form field: a boolean, or – with `value` – one entry of a list. A required checkbox must be
 * checked. Shows the field's error below the checkbox once it was touched or the form was submitted.
 */
export const CheckboxField = forwardRef(function CheckboxField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, onFocus, value, ...props }: CheckboxFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const [fieldProps, checkboxProps] = splitFieldProps(controlProps, groupFieldPropKeys);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <Field
            layout="group"
            {...fieldProps}
            required={options.required}
            {...validationProps}
            onBlur={(event) => {
                if (leavesField(event)) {
                    field.onBlur();
                }
            }}
            onFocus={onFocus}
        >
            <Checkbox
                {...checkboxProps}
                ref={ref}
                name={field.name}
                value={value}
                checked={isCheckboxChecked(field.value, value)}
                onChange={(checked) => field.onChange(toggleCheckboxValue(field.value, value, checked))}
            />
        </Field>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: CheckboxFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
