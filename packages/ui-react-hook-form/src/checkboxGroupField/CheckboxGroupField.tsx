import { CheckboxGroup, type CheckboxGroupProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface CheckboxGroupFieldProps<
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<CheckboxGroupProps<Value>, "name" | "value" | "onChange" | "onBlur" | "required" | "state" | "validationMessage"> {}

export function toCheckboxGroupValue<Value extends string>(value: unknown): Value[] {
    if (Array.isArray(value)) {
        return value as Value[];
    }
    return value == null || value === "" ? [] : [value as Value];
}

/**
 * A `CheckboxGroup` connected to a React Hook Form field holding the list of the checked options' values. A required group needs at least
 * one checked option. Shows the field's error below the options once it was touched or the form was submitted.
 */
export const CheckboxGroupField = forwardRef(function CheckboxGroupField<
    Value extends string,
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({ name, ...props }: CheckboxGroupFieldProps<Value, TFieldValues, TName>, forwardedRef: ForwardedRef<HTMLDivElement>) {
    const [options, checkboxGroupProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <CheckboxGroup<Value>
            {...checkboxGroupProps}
            {...validationProps}
            ref={ref}
            name={field.name}
            value={toCheckboxGroupValue<Value>(field.value)}
            required={options.required}
            onChange={field.onChange}
            onBlur={field.onBlur}
        />
    );
}) as <
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: CheckboxGroupFieldProps<Value, TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
