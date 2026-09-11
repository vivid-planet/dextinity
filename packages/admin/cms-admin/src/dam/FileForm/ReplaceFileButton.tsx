import { useApolloClient } from "@apollo/client";
import { Button, useErrorDialog } from "@dextinity/admin";
import { ThreeDotSaving, Upload } from "@dextinity/admin-icons";
import { useRef, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { FormattedMessage } from "react-intl";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { replaceById } from "../../form/file/upload";
import { useDamBasePath, useDamConfig } from "../config/damConfig";
import { convertMimetypesToDropzoneAccept } from "../DataGrid/fileUpload/fileUpload.utils";
import type { DamFileDetails } from "./EditFile";

interface ReplaceFileButtonProps {
    file: DamFileDetails;
}

export function ReplaceFileButton({ file }: ReplaceFileButtonProps) {
    const apolloClient = useApolloClient();
    const { apiUrl } = useDextinityConfig();
    const damConfig = useDamConfig();
    const damBasePath = useDamBasePath();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const maxFileSizeInMegabytes = damConfig.uploadsMaxFileSize;
    const maxFileSizeInBytes = maxFileSizeInMegabytes * 1024 * 1024;
    const errorDialog = useErrorDialog();
    const [replaceLoading, setReplaceLoading] = useState(false);

    const { getInputProps } = useDropzone({
        maxSize: maxFileSizeInBytes,
        multiple: false,
        accept: convertMimetypesToDropzoneAccept([file.mimetype]),
        onDrop: async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            if (fileRejections.length > 0) {
                errorDialog?.showError({
                    userMessage: (
                        <FormattedMessage
                            id="dextinity.dam.file.replace.fileRejection"
                            defaultMessage="The selected file could not be uploaded because it doesn't meet the required criteria. Please choose a valid file to replace the existing one."
                        />
                    ),
                    error: fileRejections.toString(),
                });
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
                    data: { file: acceptedFiles[0], fileId: file.id },
                    damBasePath,
                });
                if (response.data) {
                    const fileUrl = (response.data as { fileUrl?: string })?.fileUrl;
                    if (fileUrl) {
                        apolloClient.cache.evict({ id: `DamFile:${file.id}` });
                    }
                }
                setReplaceLoading(false);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    setReplaceLoading(false);
                    return;
                }
                errorDialog?.showError({
                    userMessage: (
                        <FormattedMessage
                            id="dextinity.dam.file.replace.error"
                            defaultMessage="An error occurred while replacing the file. Please try again later."
                        />
                    ),
                    error: error instanceof Error ? error.message : String(error),
                });
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
