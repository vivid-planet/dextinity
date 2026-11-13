import { Field, FileUpload, type FileUploadFile, type FileUploadProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface FileUploadFieldProps<FieldValue = FileUploadFile[]>
    extends
        FieldAdapterBaseProps,
        FieldAdapterFieldProps,
        FinalFormFieldConfig<FieldValue, FileUploadFile[]>,
        Omit<FileUploadProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "required" | "state" | "validationMessage"> {}

export function toFileUploadValue(value: unknown): FileUploadFile[] {
    if (Array.isArray(value)) {
        return value as FileUploadFile[];
    }
    return value == null || value === "" ? [] : [value as FileUploadFile];
}

/**
 * A `FileUpload` connected to a React Final Form field holding the list of uploaded files, as `onUpload` describes them. A required
 * field needs at least one uploaded file. Shows the field's error below the files once it was touched or the form was submitted.
 */
export const FileUploadField = memo(
    forwardRef(function FileUploadField<FieldValue = FileUploadFile[]>(
        { name, onFocus, ...props }: FileUploadFieldProps<FieldValue>,
        forwardedRef: ForwardedRef<HTMLDivElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, fileUploadProps] = splitFieldProps(controlProps, groupFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, FileUploadFile[], HTMLDivElement>(name, options, forwardedRef);

        return (
            <Field
                layout="group"
                {...fieldProps}
                {...validationProps}
                required={options.required}
                onBlur={(event) => {
                    // Moving between the field's own buttons, or to the file dialog, isn't leaving the field, so it isn't touched yet
                    const leavesField =
                        event.relatedTarget == null ? document.hasFocus() : !event.currentTarget.contains(event.relatedTarget as Node);
                    if (leavesField) {
                        onBlur();
                    }
                }}
                onFocus={(event) => {
                    onFieldFocus();
                    onFocus?.(event);
                }}
            >
                <FileUpload {...fileUploadProps} ref={ref} name={input.name} value={toFileUploadValue(input.value)} onChange={input.onChange} />
            </Field>
        );
    }),
) as <FieldValue = FileUploadFile[]>(props: FileUploadFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
