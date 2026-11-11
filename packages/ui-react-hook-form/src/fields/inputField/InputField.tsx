import { TextField, type TextFieldProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface InputFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<TextFieldProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string>;
}

/**
 * A `TextField` connected to a React Hook Form field. Shows the field's error once it was touched or the form was submitted. An
 * emptied field gets its default value back when that is empty (`""` or `null`), so it counts as unchanged.
 */
export const InputField = forwardRef(function InputField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, actions, ...props }: InputFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, inputProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref, setValue } = useFieldAdapter<TFieldValues, TName, HTMLInputElement>({ name, ...options }, forwardedRef);
    const value: string = field.value ?? "";

    return (
        <TextField
            {...inputProps}
            {...validationProps}
            ref={ref}
            name={field.name}
            value={value}
            required={options.required}
            actions={renderActions(actions, value, setValue)}
            onChange={(event) => setValue(event.target.value)}
            onBlur={field.onBlur}
        />
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: InputFieldProps<TFieldValues, TName> & RefAttributes<HTMLInputElement>,
) => ReactNode;
