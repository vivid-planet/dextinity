import { gql } from "@apollo/client";
import {
    commonFileErrorMessages,
    type ErrorFileSelectItem,
    FileSelect,
    type FileSelectProps,
    type LoadingFileSelectItem,
    type ValidFileSelectItem,
} from "@dextinity/admin";
import { useMemo, useState } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import type { GQLFinalFormFileUploadDownloadableFragment, GQLFinalFormFileUploadFragment } from "./FinalFormFileUpload.generated";

export const finalFormFileUploadFragment = gql`
    fragment FinalFormFileUpload on FileUpload {
        id
        name
        size
    }
`;

export const finalFormFileUploadDownloadableFragment = gql`
    fragment FinalFormFileUploadDownloadable on FileUpload {
        id
        name
        size
        downloadUrl
        imageUrl(resizeWidth: 640)
    }
`;

type SuccessfulApiResponse = {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    size: number;
    mimetype: string;
    contentHash: string;
    downloadUrl?: string;
};

type FailedApiResponse = {
    statusCode?: number;
    message?: string;
    error?: string;
};

type FinalFormFileUploadSingleFileProps = {
    multiple?: false;
    maxFiles?: 1;
};

type FinalFormFileUploadSingleFilesInternalProps = FieldRenderProps<
    GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment,
    HTMLInputElement
>;

type FinalFormFileUploadMultipleFilesProps = {
    multiple: true;
    maxFiles?: number;
};

type FinalFormFileUploadMultipleFilesInternalProps = FieldRenderProps<
    Array<GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment>,
    HTMLInputElement
>;

type FinalFormFileUploadInternalProps<Multiple extends boolean | undefined> = Multiple extends true
    ? FinalFormFileUploadMultipleFilesInternalProps
    : FinalFormFileUploadSingleFilesInternalProps;

export type FinalFormFileUploadProps<Multiple extends boolean | undefined> = (Multiple extends true
    ? FinalFormFileUploadMultipleFilesProps
    : FinalFormFileUploadSingleFileProps) &
    Partial<FileSelectProps<GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment>> & {
        uploadEndpoint?: string;
        /**
         * The duration in seconds after which the file will be deleted.
         * Leaving it undefined will take the default value from the module configuration in the API
         * If both the default configuration and expiresIn are undefined, the file will never be deleted.
         */
        expiresIn?: number;
    };

export const FinalFormFileUpload = <Multiple extends boolean | undefined>({
    input: { onChange, value: fieldValue, multiple },
    expiresIn,
    maxFiles,
    uploadEndpoint,
    ...restProps
}: FinalFormFileUploadProps<Multiple> & FinalFormFileUploadInternalProps<Multiple>) => {
    const [tooManyFilesSelected, setTooManyFilesSelected] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<LoadingFileSelectItem[]>([]);
    const [failedUploads, setFailedUploads] = useState<ErrorFileSelectItem[]>([]);
    const { apiUrl } = useDextinityConfig();

    const singleFile = (!multiple && typeof maxFiles === "undefined") || maxFiles === 1;
    const inputValue = useMemo<ValidFileSelectItem<GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment>[]>(() => {
        const files = Array.isArray(fieldValue) ? fieldValue : fieldValue ? [fieldValue] : [];
        return files.map((file) => {
            let previewUrl: string | undefined = undefined;

            if (isDownloadableFile(file) && file.imageUrl) {
                const isNewlyUploadedFile = file.imageUrl.startsWith("blob:");

                if (isNewlyUploadedFile) {
                    previewUrl = file.imageUrl;
                } else {
                    previewUrl = `${apiUrl}${file.imageUrl}`;
                }
            }

            return {
                ...file,
                previewUrl,
            };
        });
    }, [fieldValue, apiUrl]);

    const files = [...inputValue, ...failedUploads, ...uploadingFiles];

    return (
        <FileSelect<GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment>
            onDrop={async (acceptedFiles, rejectedFiles) => {
                setFailedUploads([]);

                const tooManyFilesWereDropped = rejectedFiles.some((rejection) => rejection.errors.some((error) => error.code === "too-many-files"));
                setTooManyFilesSelected(tooManyFilesWereDropped);

                if (tooManyFilesWereDropped || !acceptedFiles.length) {
                    return;
                }

                rejectedFiles.map((rejection) => {
                    const failedFile: ErrorFileSelectItem = {
                        name: rejection.file.name,
                        error: true,
                    };

                    if (rejection.errors.some((error) => error.code === "file-too-large")) {
                        failedFile.error = commonFileErrorMessages.fileTooLarge;
                    }

                    if (rejection.errors.some((error) => error.code === "file-invalid-type")) {
                        failedFile.error = commonFileErrorMessages.invalidFileType;
                    }

                    setFailedUploads((existing) => [...existing, failedFile]);
                });

                if (singleFile) {
                    onChange(undefined);
                }

                setUploadingFiles(acceptedFiles.map((file) => ({ name: file.name, loading: true })));

                const successfullyUploadedFiles: Array<GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment> = [];

                for (const file of acceptedFiles) {
                    const formData = new FormData();
                    formData.append("file", file);
                    if (expiresIn) {
                        formData.append("expiresIn", expiresIn.toString());
                    }
                    const response = await fetch(uploadEndpoint ?? `${apiUrl}/file-uploads/upload`, {
                        method: "POST",
                        body: formData,
                    });
                    const jsonResponse: SuccessfulApiResponse | FailedApiResponse = await response.json();

                    if ("id" in jsonResponse) {
                        setUploadingFiles((existing) => existing.filter((loadingFile) => loadingFile.name !== file.name));
                        const newlyUploadedFile: GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment = {
                            id: jsonResponse.id,
                            name: jsonResponse.name,
                            size: jsonResponse.size,
                            imageUrl: ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type) ? URL.createObjectURL(file) : null,
                        };

                        if (jsonResponse.downloadUrl) {
                            (newlyUploadedFile as GQLFinalFormFileUploadDownloadableFragment).downloadUrl = jsonResponse.downloadUrl;
                        }

                        if (singleFile) {
                            onChange(newlyUploadedFile);
                        } else {
                            successfullyUploadedFiles.push(newlyUploadedFile);
                            onChange([...inputValue, ...successfullyUploadedFiles]);
                        }
                    } else {
                        let errorMessage = <FormattedMessage id="dextinity.finalFormFileUpload.uploadFailed" defaultMessage="Upload failed." />;

                        if (jsonResponse.message === "Unsupported mime type") {
                            errorMessage = commonFileErrorMessages.invalidFileType;
                        }

                        setUploadingFiles((existing) => existing.filter((loadingFile) => loadingFile.name !== file.name));
                        setFailedUploads((existing) => [
                            ...existing,
                            {
                                name: file.name,
                                error: errorMessage,
                            },
                        ]);
                    }
                }
            }}
            onRemove={(fileToRemove) => {
                setTooManyFilesSelected(false);

                if (singleFile) {
                    onChange(undefined);
                } else if ("id" in fileToRemove) {
                    onChange(inputValue.filter(({ id }) => id !== fileToRemove.id));
                }

                if ("error" in fileToRemove) {
                    setFailedUploads((existingFiles) => existingFiles.filter((failedFile) => failedFile.name !== fileToRemove.name));
                }
            }}
            files={files}
            multiple={multiple}
            maxFiles={maxFiles}
            error={tooManyFilesSelected ? commonFileErrorMessages.tooManyFiles(maxFiles ? maxFiles : 1) : undefined}
            getDownloadUrl={(file) => (isDownloadableFile(file) && file.downloadUrl ? `${apiUrl}${file.downloadUrl}` : undefined)}
            {...restProps}
        />
    );
};

function isDownloadableFile(
    file: GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment,
): file is GQLFinalFormFileUploadDownloadableFragment {
    return "downloadUrl" in file;
}
