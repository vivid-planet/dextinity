import { NumberInput, type NumberInputProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface NumberFieldProps<FieldValue = number | null>
    extends
        FieldAdapterBaseProps,
        Omit<FinalFormFieldConfig<FieldValue, number | null>, "format">,
        Omit<NumberInputProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<number | null>;
}

export function toNumberValue(value: unknown): number | null {
    return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

/**
 * A `NumberInput` connected to a numeric React Final Form field: a number, or `null` while the field is empty. Shows the field's error once
 * it was touched or the form was submitted.
 */
export const NumberField = forwardRef(function NumberField<FieldValue = number | null>(
    { name, actions, format, onFocus, ...props }: NumberFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, numberInputProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, number | null, HTMLInputElement>(name, options, forwardedRef);
    const value = toNumberValue(input.value);

    return (
        <NumberInput
            {...numberInputProps}
            {...validationProps}
            ref={ref}
            name={input.name}
            value={value}
            format={format}
            required={options.required}
            actions={renderActions(actions, value, input.onChange)}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <FieldValue = number | null>(props: NumberFieldProps<FieldValue> & RefAttributes<HTMLInputElement>) => ReactNode;
