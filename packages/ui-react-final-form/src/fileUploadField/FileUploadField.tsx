import { FileUpload, type FileUploadFile, type FileUploadProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface FileUploadFieldProps<FieldValue = FileUploadFile[]>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, FileUploadFile[]>,
        Omit<FileUploadProps, "name" | "value" | "onChange" | "onBlur" | "required" | "state" | "validationMessage"> {}

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
export const FileUploadField = forwardRef(function FileUploadField<FieldValue = FileUploadFile[]>(
    { name, onFocus, ...props }: FileUploadFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, fileUploadProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, FileUploadFile[], HTMLDivElement>(name, options, forwardedRef);

    return (
        <FileUpload
            {...fileUploadProps}
            {...validationProps}
            ref={ref}
            name={input.name}
            value={toFileUploadValue(input.value)}
            required={options.required}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <FieldValue = FileUploadFile[]>(props: FileUploadFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
