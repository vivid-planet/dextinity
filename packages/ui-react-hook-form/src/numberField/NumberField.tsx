import { NumberInput, type NumberInputProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface NumberFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<NumberInputProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<number | null>;
}

export function toNumberValue(value: unknown): number | null {
    return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

/**
 * A `NumberInput` connected to a numeric React Hook Form field: a number, or `null` while the field is empty. Shows the field's error once
 * it was touched or the form was submitted.
 */
export const NumberField = forwardRef(function NumberField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, actions, ...props }: NumberFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, numberInputProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLInputElement>({ name, ...options }, forwardedRef);
    const value = toNumberValue(field.value);

    return (
        <NumberInput
            {...numberInputProps}
            {...validationProps}
            ref={ref}
            name={field.name}
            value={value}
            required={options.required}
            actions={renderActions(actions, value, field.onChange)}
            onChange={field.onChange}
            onBlur={field.onBlur}
        />
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: NumberFieldProps<TFieldValues, TName> & RefAttributes<HTMLInputElement>,
) => ReactNode;
