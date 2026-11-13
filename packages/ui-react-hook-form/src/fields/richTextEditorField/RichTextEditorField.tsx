import { Field, RichTextEditor, type RichTextEditorProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface RichTextEditorFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        FieldAdapterBoxFieldProps,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<RichTextEditorProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<string>;
}

/**
 * Whether rich text has no visible text, e.g. `<p><br></p>` left after deleting everything.
 */
export function isEmptyRichText(html: unknown) {
    if (typeof html !== "string") {
        return html == null;
    }
    return (
        html
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim() === ""
    );
}

/**
 * A `RichTextEditor` connected to a React Hook Form field, with the HTML as value. A required field counts as empty while it has no
 * visible text. Shows the field's error once it was touched or the form was submitted.
 */
export const RichTextEditorField = forwardRef(function RichTextEditorField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, onFocus, actions, ...props }: RichTextEditorFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const [fieldProps, editorProps] = splitFieldProps(controlProps, boxFieldPropKeys);
    const { field, validationProps, ref, setValue } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>(
        { name, ...options, isEmpty: isEmptyRichText, isBlank: isEmptyRichText },
        forwardedRef,
    );
    const value: string = field.value ?? "";

    return (
        <Field
            layout="stacked"
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
            <RichTextEditor {...editorProps} ref={ref} name={field.name} value={value} onChange={setValue} />
        </Field>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: RichTextEditorFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
