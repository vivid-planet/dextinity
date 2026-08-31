import { useApolloClient } from "@apollo/client";
import { Alert, Button, useErrorDialog, useSnackbarApi } from "@dextinity/admin";
import { ThreeDotSaving, Upload } from "@dextinity/admin-icons";
import { Snackbar } from "@mui/material";
import { useRef, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { FormattedMessage } from "react-intl";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { replaceById } from "../../form/file/upload";
import { useDamBasePath, useDamConfig } from "../config/damConfig";
import { getDamFileCategory } from "../config/damFileCategory";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { convertMimetypesToDropzoneAccept } from "../DataGrid/fileUpload/fileUpload.utils";
import type { DamFileDetails } from "./EditFile";

interface ReplaceFileButtonProps {
    file: DamFileDetails;
}

const replaceFileErrorTitle = <FormattedMessage id="dextinity.dam.file.replace.errorTitle" defaultMessage="File could not be replaced" />;

export function ReplaceFileButton({ file }: ReplaceFileButtonProps) {
    const apolloClient = useApolloClient();
    const { apiUrl } = useDextinityConfig();
    const damConfig = useDamConfig();
    const damBasePath = useDamBasePath();
    const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const maxFileSizeInMegabytes = damConfig.uploadsMaxFileSize;
    const maxFileSizeInBytes = maxFileSizeInMegabytes * 1024 * 1024;
    const errorDialog = useErrorDialog();
    const snackbarApi = useSnackbarApi();
    const [replaceLoading, setReplaceLoading] = useState(false);

    const fileCategory = getDamFileCategory(file.mimetype);
    const acceptedMimeTypesForReplacement = fileCategory === "document" ? [file.mimetype] : filteredAcceptedMimeTypes[fileCategory];

    const { getInputProps } = useDropzone({
        maxSize: maxFileSizeInBytes,
        multiple: false,
        accept: convertMimetypesToDropzoneAccept(acceptedMimeTypesForReplacement),
        onDrop: async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            if (fileRejections.length > 0) {
                errorDialog?.showError({
                    title: replaceFileErrorTitle,
                    userMessage: (
                        <FormattedMessage
                            id="dextinity.dam.file.replace.fileRejection"
                            defaultMessage="The selected file could not be uploaded because it doesn't meet the required criteria. Please choose a valid file to replace the existing one."
                        />
                    ),
                    error: fileRejections.toString(),
                });
                return;
            }

            const uploadedFile = acceptedFiles[0];
            if (uploadedFile === undefined) {
                return;
            }

            try {
                setReplaceLoading(true);
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                const abortController = new AbortController();
                abortControllerRef.current = abortController;
                const response = await replaceById({
                    apiUrl,
                    data: { file: uploadedFile, fileId: file.id },
                    damBasePath,
                });
                const replacedFile = response.data as { name?: string } | undefined;

                apolloClient.cache.evict({ id: `DamFile:${file.id}` });

                if (replacedFile?.name !== undefined && replacedFile.name !== file.name) {
                    snackbarApi.showSnackbar(
                        <Snackbar autoHideDuration={5000}>
                            <Alert severity="info">
                                <FormattedMessage
                                    id="dextinity.dam.file.replace.renamed"
                                    defaultMessage="The file was renamed to {name} because another file with its name already exists in this folder."
                                    values={{ name: replacedFile.name }}
                                />
                            </Alert>
                        </Snackbar>,
                    );
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                const message = error instanceof Error ? error.message : String(error);

                errorDialog?.showError({
                    title: replaceFileErrorTitle,
                    userMessage: (
                        <FormattedMessage
                            id="dextinity.dam.file.replace.error"
                            defaultMessage="An error occurred while replacing the file. Please try again later."
                        />
                    ),
                    error: message,
                });
            } finally {
                setReplaceLoading(false);
            }
        },
    });

    return (
        <>
            <Button
                variant="textLight"
                startIcon={replaceLoading ? <ThreeDotSaving /> : <Upload />}
                onClick={() => {
                    // Trigger file input with button click
                    fileInputRef.current?.click();
                }}
            >
                <FormattedMessage id="dextinity.dam.file.replaceFile" defaultMessage="Replace File" />
            </Button>
            <input type="file" hidden {...getInputProps()} ref={fileInputRef} />
        </>
    );
}
