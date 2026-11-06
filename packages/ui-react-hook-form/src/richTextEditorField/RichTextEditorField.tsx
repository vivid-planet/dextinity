import { RichTextEditor, type RichTextEditorProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface RichTextEditorFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<RichTextEditorProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
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
    { name, actions, ...props }: RichTextEditorFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, editorProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>(
        { name, ...options, isEmpty: isEmptyRichText },
        forwardedRef,
    );
    const value: string = field.value ?? "";

    return (
        <RichTextEditor
            {...editorProps}
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
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: RichTextEditorFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
