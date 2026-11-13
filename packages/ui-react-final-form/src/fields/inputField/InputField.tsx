import { Field, type FieldBaseProps, type FieldProps, Input, type InputProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface InputFieldProps<FieldValue = string>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, string>,
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
 * A text field, a `Field` with an `Input`, connected to a React Final Form field. Shows the field's error once it was touched or the form was submitted. An
 * emptied field counts as unchanged when its initial value is `""`, `null`, or `undefined`.
 */
export const InputField = forwardRef(function InputField<FieldValue = string>(
    {
        name,
        actions,
        onFocus,
        label,
        helperText,
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
    }: InputFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, inputProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, string, HTMLInputElement>(name, options, forwardedRef);
    const value = input.value ?? "";

    return (
        <Field
            {...validationProps}
            className={className}
            controlId={id}
            label={label}
            required={options.required}
            helperText={helperText}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading}
            size={size}
            prefix={prefix}
            suffix={suffix}
            actions={renderActions(actions, value, input.onChange)}
            counter={showCount ? (maxLength != null ? `${value.length} / ${maxLength}` : `${value.length}`) : undefined}
            slotProps={slotProps}
        >
            <Input
                {...inputProps}
                ref={ref}
                name={input.name}
                value={value}
                maxLength={maxLength}
                onChange={input.onChange}
                onBlur={onBlur}
                onFocus={(event) => {
                    onFieldFocus();
                    onFocus?.(event);
                }}
            />
        </Field>
    );
}) as <FieldValue = string>(props: InputFieldProps<FieldValue> & RefAttributes<HTMLInputElement>) => ReactNode;
