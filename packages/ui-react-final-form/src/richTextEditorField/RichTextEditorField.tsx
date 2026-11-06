import { RichTextEditor, type RichTextEditorProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface RichTextEditorFieldProps<FieldValue = string>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, string>,
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
 * A `RichTextEditor` connected to a React Final Form field, with the HTML as value. A required field counts as empty while it has no
 * visible text. Shows the field's error once it was touched or the form was submitted.
 */
export const RichTextEditorField = forwardRef(function RichTextEditorField<FieldValue = string>(
    { name, actions, onFocus, ...props }: RichTextEditorFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, editorProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, string, HTMLDivElement>(name, { ...options, isEmpty: isEmptyRichText }, forwardedRef);
    const value = input.value ?? "";

    return (
        <RichTextEditor
            {...editorProps}
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
}) as <FieldValue = string>(props: RichTextEditorFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
