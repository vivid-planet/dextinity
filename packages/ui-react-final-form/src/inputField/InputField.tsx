import { Input, type InputProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface InputFieldProps<FieldValue = string>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, string>,
        Omit<InputProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string>;
}

/**
 * An `Input` connected to a React Final Form field. Shows the field's error once it was touched or the form was submitted.
 */
export const InputField = forwardRef(function InputField<FieldValue = string>(
    { name, actions, onFocus, ...props }: InputFieldProps<FieldValue>,
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
        <Input
            {...inputProps}
            {...validationProps}
            ref={ref}
            name={input.name}
            value={value}
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
}) as <FieldValue = string>(props: InputFieldProps<FieldValue> & RefAttributes<HTMLInputElement>) => ReactNode;
