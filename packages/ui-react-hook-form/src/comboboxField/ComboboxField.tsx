import { Combobox, type ComboboxProps, type ComboboxValue } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";
import { toSelectValue } from "../selectField/SelectField";

export interface ComboboxFieldProps<
    Option,
    Multiple extends boolean = false,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<ComboboxProps<Option, Multiple>, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<ComboboxValue<Multiple, Option>>;
}

/**
 * A `Combobox` connected to a React Hook Form field: the chosen option or `null` for nothing chosen, a list of options with `multiple`.
 * Shows the field's error once it was touched or the form was submitted.
 */
export const ComboboxField = forwardRef(function ComboboxField<
    Option,
    Multiple extends boolean,
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({ name, actions, ...props }: ComboboxFieldProps<Option, Multiple, TFieldValues, TName>, forwardedRef: ForwardedRef<HTMLInputElement>) {
    const [options, comboboxProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLInputElement>({ name, ...options }, forwardedRef);
    const value = toSelectValue<Multiple, Option>(field.value, comboboxProps.multiple === true);

    return (
        <Combobox<Option, Multiple>
            {...comboboxProps}
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
    Option,
    Multiple extends boolean = false,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: ComboboxFieldProps<Option, Multiple, TFieldValues, TName> & RefAttributes<HTMLInputElement>,
) => ReactNode;
