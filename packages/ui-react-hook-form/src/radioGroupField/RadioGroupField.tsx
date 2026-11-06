import { RadioGroup, type RadioGroupProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface RadioGroupFieldProps<
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<RadioGroupProps<Value>, "name" | "value" | "onChange" | "onBlur" | "required" | "state" | "validationMessage"> {}

export function toRadioGroupValue<Value extends string>(value: unknown): Value | null {
    return value == null || value === "" ? null : (value as Value);
}

/**
 * A `RadioGroup` connected to a React Hook Form field holding one of the options' values. Without a value, no option is chosen. Shows the
 * field's error below the options once it was touched or the form was submitted.
 */
export const RadioGroupField = forwardRef(function RadioGroupField<
    Value extends string,
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({ name, ...props }: RadioGroupFieldProps<Value, TFieldValues, TName>, forwardedRef: ForwardedRef<HTMLDivElement>) {
    const [options, radioGroupProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <RadioGroup<Value>
            {...radioGroupProps}
            {...validationProps}
            ref={ref}
            name={field.name}
            value={toRadioGroupValue<Value>(field.value)}
            required={options.required}
            onChange={field.onChange}
            onBlur={(event) => {
                // Moving between the group's own controls isn't leaving the field, so it isn't touched yet
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    field.onBlur();
                }
            }}
        />
    );
}) as <
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: RadioGroupFieldProps<Value, TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
