import { Field, NumberInput, type NumberInputProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface NumberFieldProps<FieldValue = number | null>
    extends
        FieldAdapterBaseProps,
        FieldAdapterBoxFieldProps,
        Omit<FinalFormFieldConfig<FieldValue, number | null>, "format">,
        Omit<NumberInputProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"> {
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
export const NumberField = memo(
    forwardRef(function NumberField<FieldValue = number | null>(
        { name, actions, format, onFocus, ...props }: NumberFieldProps<FieldValue>,
        forwardedRef: ForwardedRef<HTMLInputElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, numberInputProps] = splitFieldProps(controlProps, boxFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, number | null, HTMLInputElement>(name, options, forwardedRef);
        const value = toNumberValue(input.value);

        return (
            <Field
                {...fieldProps}
                {...validationProps}
                required={options.required}
                actions={renderActions(actions, value, input.onChange)}
                onBlur={(event) => {
                    if (leavesField(event)) {
                        onBlur();
                    }
                }}
                onFocus={(event) => {
                    onFieldFocus();
                    onFocus?.(event);
                }}
            >
                <NumberInput {...numberInputProps} ref={ref} name={input.name} value={value} format={format} onChange={input.onChange} />
            </Field>
        );
    }),
) as <FieldValue = number | null>(props: NumberFieldProps<FieldValue> & RefAttributes<HTMLInputElement>) => ReactNode;
