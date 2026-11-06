import { Select, type SelectProps, type SelectValue } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface SelectFieldProps<
    Multiple extends boolean = false,
    Value = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<SelectProps<Multiple, Value>, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<SelectValue<Multiple, Value>>;
}

export function toSelectValue<Multiple extends boolean, Value = string>(value: unknown, multiple: boolean): SelectValue<Multiple, Value> {
    if (multiple) {
        return (Array.isArray(value) ? value : value == null || value === "" ? [] : [value]) as SelectValue<Multiple, Value>;
    }
    return (value == null || value === "" ? null : value) as SelectValue<Multiple, Value>;
}

/**
 * A `Select` connected to a React Hook Form field: a value of any type or `null` for nothing chosen, a list with `multiple`. Shows the field's error
 * once it was touched or the form was submitted.
 */
export const SelectField = forwardRef(function SelectField<
    Multiple extends boolean,
    Value,
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({ name, actions, ...props }: SelectFieldProps<Multiple, Value, TFieldValues, TName>, forwardedRef: ForwardedRef<HTMLButtonElement>) {
    const [options, selectProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLButtonElement>({ name, ...options }, forwardedRef);
    const value = toSelectValue<Multiple, Value>(field.value, selectProps.multiple === true);

    return (
        <Select<Multiple, Value>
            {...selectProps}
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
}) as <
    Multiple extends boolean = false,
    Value = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: SelectFieldProps<Multiple, Value, TFieldValues, TName> & RefAttributes<HTMLButtonElement>,
) => ReactNode;
