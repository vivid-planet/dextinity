import type { JSONContent } from "@tiptap/react";
import type { FieldValidator } from "final-form";
import { useMemo } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { Field, type FieldProps } from "../form/Field";
import { createEmptyTipTapRichTextContent, isTipTapRichTextEmpty } from "./content";
import { TipTapRichTextEditor, type TipTapRichTextEditorProps } from "./TipTapRichTextEditor";

type FinalFormTipTapRichTextEditorOwnProps = Pick<
    TipTapRichTextEditorProps,
    "options" | "readOnly" | "iconMapping" | "sx" | "className" | "slotProps"
> & {
    disabled?: boolean;
};

export type FinalFormTipTapRichTextEditorProps = FieldRenderProps<JSONContent | undefined> & FinalFormTipTapRichTextEditorOwnProps;

/**
 * Final Form-compatible `TipTapRichTextEditor`.
 *
 * @see {@link TipTapRichTextEditorField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export function FinalFormTipTapRichTextEditor({
    input: { value, onChange },
    options,
    readOnly,
    disabled,
    iconMapping,
    sx,
    className,
    slotProps,
}: FinalFormTipTapRichTextEditorProps) {
    // Final Form holds an empty string until the field has a value.
    const emptyContent = useMemo(() => createEmptyTipTapRichTextContent(options), [options]);

    return (
        <TipTapRichTextEditor
            value={value || emptyContent}
            onChange={onChange}
            options={options}
            readOnly={readOnly || disabled}
            iconMapping={iconMapping}
            sx={sx}
            className={className}
            slotProps={slotProps}
        />
    );
}

export type TipTapRichTextEditorFieldProps = FieldProps<JSONContent | undefined, HTMLDivElement> & FinalFormTipTapRichTextEditorOwnProps;

// Field's own required validator only checks for a missing value, but an editor emptied by the user still holds a document.
const requiredValidator: FieldValidator<JSONContent | undefined> = (value) =>
    value && isTipTapRichTextEmpty(value) ? <FormattedMessage id="dextinity.form.required" defaultMessage="Required" /> : undefined;

export function TipTapRichTextEditorField({ required, validate, ...restProps }: TipTapRichTextEditorFieldProps) {
    const validateContent: FieldValidator<JSONContent | undefined> | undefined = required
        ? (value, allValues, meta) => requiredValidator(value, allValues, meta) ?? validate?.(value, allValues, meta)
        : validate;

    return <Field component={FinalFormTipTapRichTextEditor} required={required} validate={validateContent} {...restProps} />;
}
