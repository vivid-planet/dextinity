import { FileUpload, type FileUploadFile, type FileUploadProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface FileUploadFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<FileUploadProps, "name" | "value" | "onChange" | "onBlur" | "required" | "state" | "validationMessage"> {}

export function toFileUploadValue(value: unknown): FileUploadFile[] {
    if (Array.isArray(value)) {
        return value as FileUploadFile[];
    }
    return value == null || value === "" ? [] : [value as FileUploadFile];
}

/**
 * A `FileUpload` connected to a React Hook Form field holding the list of uploaded files, as `onUpload` describes them. A required
 * field needs at least one uploaded file. Shows the field's error below the files once it was touched or the form was submitted.
 */
export const FileUploadField = forwardRef(function FileUploadField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, ...props }: FileUploadFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, fileUploadProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <FileUpload
            {...fileUploadProps}
            {...validationProps}
            ref={ref}
            name={field.name}
            value={toFileUploadValue(field.value)}
            required={options.required}
            onChange={field.onChange}
            onBlur={(event) => {
                // Moving between the field's own buttons, or to the file dialog, isn't leaving the field, so it isn't touched yet
                const leavesField = event.relatedTarget == null ? document.hasFocus() : !event.currentTarget.contains(event.relatedTarget as Node);
                if (leavesField) {
                    field.onBlur();
                }
            }}
        />
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: FileUploadFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
