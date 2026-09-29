import { useThemeProps } from "@mui/material/styles";
import { useCallback, useState } from "react";
import type { DropzoneOptions } from "react-dropzone";
import type { FieldRenderProps } from "react-final-form";

import { commonErrorMessages } from "./file/commonErrorMessages";
import { FileSelect, type FileSelectProps } from "./file/FileSelect";
import type { ErrorFileSelectItem, ValidFileSelectItem } from "./file/fileSelectItemTypes";

export interface FinalFormFileSelectProps
    extends FieldRenderProps<File | File[], HTMLInputElement>,
        Omit<FileSelectProps, "files" | "onDrop" | "onRemove"> {}

export function FinalFormFileSelect(inProps: FinalFormFileSelectProps) {
    const {
        disabled,
        maxFiles,
        maxSize,
        input: { onChange, value: fieldValue, multiple },
        meta,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminFinalFormFileSelect",
    });

    const [tooManyFilesSelected, setTooManyFilesSelected] = useState(false);
    const [rejectedFiles, setRejectedFiles] = useState<ErrorFileSelectItem[]>([]);
    const singleFile = (!multiple && typeof maxFiles === "undefined") || maxFiles === 1;

    const onDrop = useCallback<NonNullable<DropzoneOptions["onDrop"]>>(
        (acceptedFiles, fileRejections) => {
            setRejectedFiles(
                fileRejections.map((rejectedFile) => {
                    const failedFile: ErrorFileSelectItem = {
                        name: rejectedFile.file.name,
                        error: true,
                    };

                    if (rejectedFile.errors.some((error) => error.code === "file-too-large")) {
                        failedFile.error = commonErrorMessages.fileTooLarge;
                    }

                    if (rejectedFile.errors.some((error) => error.code === "file-invalid-type")) {
                        failedFile.error = commonErrorMessages.invalidFileType;
                    }

                    return failedFile;
                }),
            );

            const tooManyFilesWereDropped = fileRejections.some((rejectedFile) =>
                rejectedFile.errors.some((error) => error.code === "too-many-files"),
            );
            setTooManyFilesSelected(tooManyFilesWereDropped);

            if (singleFile) {
                onChange(acceptedFiles[0]);
            } else {
                if (Array.isArray(fieldValue)) {
                    if (!maxFiles || (maxFiles && fieldValue.length < maxFiles && fieldValue.length + acceptedFiles.length <= maxFiles)) {
                        onChange([...fieldValue, ...acceptedFiles]);
                    }
                } else {
                    onChange([...acceptedFiles]);
                }
            }
        },
        [fieldValue, singleFile, onChange, maxFiles],
    );

    const acceptedFiles: ValidFileSelectItem[] = [];

    if (Array.isArray(fieldValue)) {
        fieldValue.forEach(({ name, size }) => {
            acceptedFiles.push({ name, size });
        });
    } else if (fieldValue.name !== undefined) {
        acceptedFiles.push({ name: fieldValue.name, size: fieldValue.size });
    }

    return (
        <FileSelect
            files={[...acceptedFiles, ...rejectedFiles]}
            onDrop={onDrop}
            onRemove={(fileToRemove) => {
                const newFiles = Array.isArray(fieldValue) ? fieldValue.filter((file) => file.name !== fileToRemove.name) : undefined;
                onChange(newFiles);
                setTooManyFilesSelected(false);
                setRejectedFiles(rejectedFiles.filter((file) => file.name !== fileToRemove.name));
            }}
            disabled={disabled}
            multiple={multiple}
            maxFiles={maxFiles}
            maxFileSize={maxSize}
            error={typeof maxFiles !== "undefined" && tooManyFilesSelected ? commonErrorMessages.tooManyFiles(maxFiles) : undefined}
            {...restProps}
        />
    );
}
