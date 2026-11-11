import { Textarea, type TextareaProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface TextareaFieldProps<FieldValue = string>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, string>,
        Omit<TextareaProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string>;
}

/**
 * A `Textarea` connected to a React Final Form field. Shows the field's error once it was touched or the form was submitted. An
 * emptied field counts as unchanged when its initial value is `""`, `null`, or `undefined`.
 */
export const TextareaField = forwardRef(function TextareaField<FieldValue = string>(
    { name, actions, onFocus, ...props }: TextareaFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLTextAreaElement>,
) {
    const [options, textareaProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, string, HTMLTextAreaElement>(name, options, forwardedRef);
    const value = input.value ?? "";

    return (
        <Textarea
            {...textareaProps}
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
}) as <FieldValue = string>(props: TextareaFieldProps<FieldValue> & RefAttributes<HTMLTextAreaElement>) => ReactNode;
