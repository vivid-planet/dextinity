import { RadioGroup, type RadioGroupProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface RadioGroupFieldProps<Value extends string = string, FieldValue = Value>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, Value | null>,
        Omit<RadioGroupProps<Value>, "name" | "value" | "onChange" | "onBlur" | "required" | "state" | "validationMessage"> {}

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
        const [options, radioGroupProps] = splitFieldAdapterProps(props);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, Value | null, HTMLDivElement>(name, options, forwardedRef);

        return (
            <RadioGroup<Value>
                {...radioGroupProps}
                {...validationProps}
                ref={ref}
                name={input.name}
                value={toRadioGroupValue<Value>(input.value)}
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
    }),
) as <Value extends string = string, FieldValue = Value>(props: RadioGroupFieldProps<Value, FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
