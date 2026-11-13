import { Field, Textarea, type TextareaProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface TextareaFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        FieldAdapterBoxFieldProps,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<TextareaProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string>;
}

/**
 * A `Textarea` connected to a React Hook Form field. Shows the field's error once it was touched or the form was submitted. An
 * emptied field gets its default value back when that is empty (`""` or `null`), so it counts as unchanged.
 */
export const TextareaField = forwardRef(function TextareaField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, onFocus, actions, ...props }: TextareaFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLTextAreaElement>,
) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const [fieldProps, textareaProps] = splitFieldProps(controlProps, boxFieldPropKeys);
    const { field, validationProps, ref, setValue } = useFieldAdapter<TFieldValues, TName, HTMLTextAreaElement>({ name, ...options }, forwardedRef);
    const value: string = field.value ?? "";

    return (
        <Field
            {...fieldProps}
            {...validationProps}
            required={options.required}
            actions={renderActions(actions, value, setValue)}
            onBlur={(event) => {
                if (leavesField(event)) {
                    field.onBlur();
                }
            }}
            onFocus={onFocus}
        >
            <Textarea {...textareaProps} ref={ref} name={field.name} value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: TextareaFieldProps<TFieldValues, TName> & RefAttributes<HTMLTextAreaElement>,
) => ReactNode;
