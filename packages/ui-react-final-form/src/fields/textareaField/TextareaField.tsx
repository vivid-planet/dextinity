import { Field, Textarea, type TextareaProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface TextareaFieldProps<FieldValue = string>
    extends
        FieldAdapterBaseProps,
        FieldAdapterBoxFieldProps,
        FinalFormFieldConfig<FieldValue, string>,
        Omit<TextareaProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string>;
}

/**
 * A `Textarea` connected to a React Final Form field. Shows the field's error once it was touched or the form was submitted. An
 * emptied field counts as unchanged when its initial value is `""`, `null`, or `undefined`.
 */
export const TextareaField = memo(
    forwardRef(function TextareaField<FieldValue = string>(
        { name, actions, onFocus, ...props }: TextareaFieldProps<FieldValue>,
        forwardedRef: ForwardedRef<HTMLTextAreaElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, textareaProps] = splitFieldProps(controlProps, boxFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, string, HTMLTextAreaElement>(name, options, forwardedRef);
        const value = input.value ?? "";

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
                <Textarea {...textareaProps} ref={ref} name={input.name} value={value} onChange={input.onChange} />
            </Field>
        );
    }),
) as <FieldValue = string>(props: TextareaFieldProps<FieldValue> & RefAttributes<HTMLTextAreaElement>) => ReactNode;
