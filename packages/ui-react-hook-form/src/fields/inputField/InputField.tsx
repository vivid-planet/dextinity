import { Field, type FieldBaseProps, type FieldProps, Input, type InputProps } from "@dextinity/ui";
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
        Omit<FieldBaseProps, "validationMessage" | "state" | "required" | "actions">,
        Omit<
            InputProps,
            | "name"
            | "value"
            | "defaultValue"
            | "onChange"
            | "onBlur"
            | "status"
            | "disabled"
            | "readOnly"
            | "required"
            | "loading"
            | "size"
            | "prefix"
            | "startAdornment"
            | "endAdornment"
            | "className"
            | "style"
            | "slots"
            | "slotProps"
        > {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string>;
    /**
     * Shows the character count at the label, as `count / maxLength` when `maxLength` is set.
     *
     * @defaultValue `false`
     */
    showCount?: boolean;
    /** Added alongside the field's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

/**
 * A text field, a `Field` with an `Input`, connected to a React Hook Form field. Shows the field's error once it was touched or the form was submitted. An
 * emptied field gets its default value back when that is empty (`""` or `null`), so it counts as unchanged.
 */
export const InputField = forwardRef(function InputField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    {
        name,
        actions,
        label,
        helperText,
        helpText,
        disabled,
        readOnly,
        loading,
        size,
        prefix,
        suffix,
        showCount = false,
        id,
        maxLength,
        className,
        slotProps,
        ...props
    }: InputFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, inputProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref, setValue } = useFieldAdapter<TFieldValues, TName, HTMLInputElement>({ name, ...options }, forwardedRef);
    const value: string = field.value ?? "";

    return (
        <Field
            {...validationProps}
            className={className}
            controlId={id}
            label={label}
            required={options.required}
            helperText={helperText}
            helpText={helpText}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading}
            size={size}
            prefix={prefix}
            suffix={suffix}
            actions={renderActions(actions, value, setValue)}
            counter={showCount ? (maxLength != null ? `${value.length} / ${maxLength}` : `${value.length}`) : undefined}
            slotProps={slotProps}
        >
            <Input
                {...inputProps}
                ref={ref}
                name={field.name}
                value={value}
                maxLength={maxLength}
                onChange={(event) => setValue(event.target.value)}
                onBlur={field.onBlur}
            />
        </Field>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: InputFieldProps<TFieldValues, TName> & RefAttributes<HTMLInputElement>,
) => ReactNode;
