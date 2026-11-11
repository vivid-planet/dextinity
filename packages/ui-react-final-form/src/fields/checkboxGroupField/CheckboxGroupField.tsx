import { CheckboxGroup, type CheckboxGroupProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface CheckboxGroupFieldProps<Value extends string = string, FieldValue = Value[]>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, Value[]>,
        Omit<CheckboxGroupProps<Value>, "name" | "value" | "onChange" | "onBlur" | "required" | "state" | "validationMessage"> {}

export function toCheckboxGroupValue<Value extends string>(value: unknown): Value[] {
    if (Array.isArray(value)) {
        return value as Value[];
    }
    return value == null || value === "" ? [] : [value as Value];
}

/**
 * A `CheckboxGroup` connected to a React Final Form field holding the list of the checked options' values. A required group needs at least
 * one checked option. Shows the field's error below the options once it was touched or the form was submitted.
 */
export const CheckboxGroupField = forwardRef(function CheckboxGroupField<Value extends string = string, FieldValue = Value[]>(
    { name, onFocus, ...props }: CheckboxGroupFieldProps<Value, FieldValue>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, checkboxGroupProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, Value[], HTMLDivElement>(name, options, forwardedRef);

    return (
        <CheckboxGroup<Value>
            {...checkboxGroupProps}
            {...validationProps}
            ref={ref}
            name={input.name}
            value={toCheckboxGroupValue<Value>(input.value)}
            required={options.required}
            onChange={input.onChange}
            onBlur={(event) => {
                // Moving between the group's own controls isn't leaving the field, so it isn't touched yet
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    onBlur();
                }
            }}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <Value extends string = string, FieldValue = Value[]>(
    props: CheckboxGroupFieldProps<Value, FieldValue> & RefAttributes<HTMLDivElement>,
) => ReactNode;
