import { Switch, type SwitchProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface SwitchFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<
            SwitchProps,
            "name" | "checked" | "onChange" | "onBlur" | "required" | "defaultValue" | "defaultChecked" | "state" | "validationMessage"
        > {}

/**
 * A `Switch` connected to a boolean React Hook Form field. Shows the field's error below the switch once it was touched or the form was
 * submitted.
 */
export const SwitchField = forwardRef(function SwitchField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, ...props }: SwitchFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, switchProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <Switch
            {...switchProps}
            ref={ref}
            name={field.name}
            checked={field.value === true}
            required={options.required}
            {...validationProps}
            onChange={field.onChange}
            onBlur={field.onBlur}
        />
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: SwitchFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
