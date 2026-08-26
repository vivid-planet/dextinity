import { getRecaptchaToken } from "@src/util/recaptcha/getRecaptchaToken";
import { useSiteConfig } from "@src/util/SiteConfigProvider";
import { useParams } from "next/navigation";
import { type ChangeEvent, type ReactNode, useId, useRef } from "react";
import { type ControllerProps, type FieldValues, useController } from "react-hook-form";
import { useIntl } from "react-intl";

import { ChooseFilesButton } from "./ChooseFilesButton";
import { FieldContainer, type FieldContainerFieldProps } from "./FieldContainer";
import { FileList } from "./FileList";
import styles from "./FileUploadField.module.scss";

export type FileUpload = {
    key: string;
    file: File;
    status: "uploading" | "uploaded" | "error";
    id?: string;
    errorMessage?: string;
};

export const getUploadedFileUploadIds = (fileUploads: FileUpload[]): string[] =>
    fileUploads.flatMap((fileUpload) => (fileUpload.status === "uploaded" && fileUpload.id ? [fileUpload.id] : []));

export const areAllFileUploadsFinished = (fileUploads: FileUpload[]): boolean => fileUploads.every((fileUpload) => fileUpload.status !== "uploading");

type FileUploadFieldProps<TFieldValues extends FieldValues> = Pick<ControllerProps<TFieldValues>, "name" | "control" | "rules"> &
    FieldContainerFieldProps & {
        accept?: string;
        disableMultiple?: boolean;
        buttonLabel?: ReactNode;
        validateFile?: (file: File) => string | undefined;
    };

export const FileUploadField = <TFieldValues extends FieldValues>({
    label,
    helperText,
    name,
    control,
    rules,
    accept,
    disableMultiple,
    buttonLabel,
    validateFile,
}: FileUploadFieldProps<TFieldValues>) => {
    const id = useId();
    const intl = useIntl();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const required = !!rules?.required;
    const multiple = !disableMultiple;

    const { recaptchaSiteKey } = useSiteConfig();
    const params = useParams<{ language: string }>();
    const language = params?.language;

    const { field, fieldState } = useController({
        name,
        control,
        rules: {
            ...rules,
            validate: {
                ...(rules?.validate ? (typeof rules.validate === "function" ? { custom: rules.validate } : rules.validate) : {}),
                allFileUploadsValid: (value) =>
                    ((value ?? []) as FileUpload[]).every((fileUpload) => fileUpload.status !== "error")
                        ? true
                        : intl.formatMessage({
                              id: "fileUploadField.hasFailedFileUploads",
                              defaultMessage: "Please remove files that failed to upload.",
                          }),
            },
        },
    });

    const fileUploads = (field.value ?? []) as FileUpload[];

    // Mirror the field value so the async upload loop below can read the latest file uploads across awaits.
    const fileUploadsRef = useRef(fileUploads);
    fileUploadsRef.current = fileUploads;

    const patchFileUpload = (fileUploadKey: string, patch: Partial<FileUpload>) => {
        field.onChange(fileUploadsRef.current.map((fileUpload) => (fileUpload.key === fileUploadKey ? { ...fileUpload, ...patch } : fileUpload)));
    };

    const uploadFile = async (file: File): Promise<{ id: string }> => {
        if (!recaptchaSiteKey) {
            throw new Error("Missing recaptchaSiteKey in siteConfig");
        }
        const recaptchaToken = await getRecaptchaToken("file_upload", recaptchaSiteKey);

        const body = new FormData();
        body.append("file", file, file.name);
        body.append("recaptchaToken", recaptchaToken);

        const response = await fetch(`/${language}/api/file-upload`, {
            method: "POST",
            body,
        });

        if (!response.ok) {
            throw new Error(`File upload failed for ${file.name}`);
        }

        return (await response.json()) as { id: string };
    };

    const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files ? Array.from(event.target.files) : [];
        event.target.value = "";

        const added: FileUpload[] = selected.map((file) => {
            const validationError = validateFile?.(file);
            return {
                key: crypto.randomUUID(),
                file,
                status: validationError ? "error" : "uploading",
                errorMessage: validationError,
            };
        });

        field.onChange(multiple ? [...fileUploads, ...added] : added);

        const toUpload = added.filter((fileUpload) => fileUpload.status === "uploading");
        for (const fileUpload of toUpload) {
            try {
                const { id: uploadedId } = await uploadFile(fileUpload.file);
                patchFileUpload(fileUpload.key, { status: "uploaded", id: uploadedId });
            } catch (error) {
                console.error(error);
                patchFileUpload(fileUpload.key, {
                    status: "error",
                    errorMessage: intl.formatMessage({
                        id: "fileUploadField.uploadFailed",
                        defaultMessage: "Upload failed. Please try again.",
                    }),
                });
            }
        }
    };

    const handleRemove = (fileUploadKey: string) => {
        field.onChange(fileUploads.filter((fileUpload) => fileUpload.key !== fileUploadKey));
    };

    const erroredFileUpload = fileUploads.find((fileUpload) => fileUpload.status === "error");
    const errorText = fieldState.error?.message ?? erroredFileUpload?.errorMessage;
    const hasError = Boolean(errorText);

    return (
        <FieldContainer required={required} label={label} helperText={helperText} errorText={errorText} htmlFor={id}>
            <div className={styles.container}>
                <input
                    ref={(node) => {
                        inputRef.current = node;
                        field.ref(node);
                    }}
                    id={id}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={handleSelect}
                    aria-invalid={hasError ? true : undefined}
                    className={styles.hiddenInput}
                />
                <ChooseFilesButton label={buttonLabel} onClick={() => inputRef.current?.click()} />
                {fileUploads.length > 0 && <FileList fileUploads={fileUploads} onRemove={handleRemove} />}
            </div>
        </FieldContainer>
    );
};
