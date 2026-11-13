import { Field, RadioGroup, type RadioGroupProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface RadioGroupFieldProps<
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        FieldAdapterFieldProps,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<RadioGroupProps<Value>, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "required" | "state" | "validationMessage"> {}

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
>({ name, onFocus, ...props }: RadioGroupFieldProps<Value, TFieldValues, TName>, forwardedRef: ForwardedRef<HTMLDivElement>) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const [fieldProps, radioGroupProps] = splitFieldProps(controlProps, groupFieldPropKeys);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <Field
            layout="group"
            {...fieldProps}
            {...validationProps}
            required={options.required}
            onBlur={(event) => {
                // Moving between the group's own controls isn't leaving the field, so it isn't touched yet
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    field.onBlur();
                }
            }}
            onFocus={onFocus}
        >
            <RadioGroup<Value>
                {...radioGroupProps}
                ref={ref}
                name={field.name}
                value={toRadioGroupValue<Value>(field.value)}
                onChange={field.onChange}
            />
        </Field>
    );
}) as <
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: RadioGroupFieldProps<Value, TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
