import { Field, RadioGroup, type RadioGroupProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface RadioGroupFieldProps<Value extends string = string, FieldValue = Value>
    extends
        FieldAdapterBaseProps,
        FieldAdapterFieldProps,
        FinalFormFieldConfig<FieldValue, Value | null>,
        Omit<RadioGroupProps<Value>, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "required" | "state" | "validationMessage"> {}

export function toRadioGroupValue<Value extends string>(value: unknown): Value | null {
    return value == null || value === "" ? null : (value as Value);
}

/**
 * A `RadioGroup` connected to a React Final Form field holding one of the options' values. Without a value, no option is chosen. Shows the
 * field's error below the options once it was touched or the form was submitted.
 */
export const RadioGroupField = memo(
    forwardRef(function RadioGroupField<Value extends string = string, FieldValue = Value>(
        { name, onFocus, ...props }: RadioGroupFieldProps<Value, FieldValue>,
        forwardedRef: ForwardedRef<HTMLDivElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, radioGroupProps] = splitFieldProps(controlProps, groupFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, Value | null, HTMLDivElement>(name, options, forwardedRef);

        return (
            <Field
                layout="group"
                {...fieldProps}
                {...validationProps}
                required={options.required}
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
            >
                <RadioGroup<Value>
                    {...radioGroupProps}
                    ref={ref}
                    name={input.name}
                    value={toRadioGroupValue<Value>(input.value)}
                    onChange={input.onChange}
                />
            </Field>
        );
    }),
) as <Value extends string = string, FieldValue = Value>(props: RadioGroupFieldProps<Value, FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
