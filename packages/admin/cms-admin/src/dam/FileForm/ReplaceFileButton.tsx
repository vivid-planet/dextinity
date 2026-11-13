import { useApolloClient } from "@apollo/client";
import { Button, Icon } from "@dextinity/ui";
import { useRef, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useIntl } from "react-intl";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { replaceById } from "../../form/file/upload";
import { useDamBasePath, useDamConfig } from "../config/damConfig";
import { getDamFileCategory } from "../config/damFileCategory";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { convertMimetypesToDropzoneAccept, getFilesWithMimeTypeFromEvent } from "../DataGrid/fileUpload/fileUpload.utils";
import type { DamFileDetails } from "./EditFile";

interface ReplaceFileButtonProps {
    file: DamFileDetails;
    /** Called with a message for the user when the file was replaced, or couldn't be. */
    onNotify: (notification: { tone: "error" | "info"; message: string }) => void;
}

/**
 * Replaces the file's content with a file chosen from the computer, keeping its ID and therefore every use. Only files of the same
 * category (image, video, …) are accepted, documents only of the same type.
 */
export function ReplaceFileButton({ file, onNotify }: ReplaceFileButtonProps) {
    const intl = useIntl();
    const apolloClient = useApolloClient();
    const { apiUrl } = useDextinityConfig();
    const damConfig = useDamConfig();
    const damBasePath = useDamBasePath();
    const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isReplacing, setIsReplacing] = useState(false);

    const fileCategory = getDamFileCategory(file.mimetype);
    const acceptedMimeTypes = fileCategory === "document" ? [file.mimetype] : filteredAcceptedMimeTypes[fileCategory];

    const notifyError = (reason?: string) => {
        const message = intl.formatMessage({ id: "dextinity.dam.file.replace.errorTitle", defaultMessage: "File could not be replaced" });
        onNotify({ tone: "error", message: reason ? `${message}: ${reason}` : message });
    };

    const { getInputProps } = useDropzone({
        maxSize: damConfig.uploadsMaxFileSize * 1024 * 1024,
        multiple: false,
        accept: convertMimetypesToDropzoneAccept(acceptedMimeTypes),
        getFilesFromEvent: getFilesWithMimeTypeFromEvent,
        onDrop: async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            if (fileRejections.length > 0) {
                notifyError(
                    intl.formatMessage({
                        id: "dextinity.dam.file.replace.fileRejection",
                        defaultMessage:
                            "The selected file could not be uploaded because it doesn't meet the required criteria. Please choose a valid file to replace the existing one.",
                    }),
                );
                return;
            }
            const uploadedFile = acceptedFiles[0];
            if (uploadedFile === undefined) {
                return;
            }
            setIsReplacing(true);
            try {
                const response = await replaceById({ apiUrl, data: { file: uploadedFile, fileId: file.id }, damBasePath });
                const replacedFile = response.data as { name?: string } | undefined;
                apolloClient.cache.evict({ id: `DamFile:${file.id}` });
                onNotify({
                    tone: "info",
                    message:
                        replacedFile?.name !== undefined && replacedFile.name !== file.name
                            ? intl.formatMessage(
                                  {
                                      id: "dextinity.dam.file.replace.renamed",
                                      defaultMessage:
                                          "The file was renamed to {name} because another file with its name already exists in this folder.",
                                  },
                                  { name: replacedFile.name },
                              )
                            : intl.formatMessage({ id: "dextinity.dam.file.replace.success", defaultMessage: "File replaced" }),
                });
            } catch (error) {
                notifyError(error instanceof Error ? error.message : undefined);
            } finally {
                setIsReplacing(false);
            }
        },
    });

    return (
        <>
            <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<Icon name="cloud-upload" />}
                loading={isReplacing}
                onClick={() => fileInputRef.current?.click()}
            >
                {intl.formatMessage({ id: "dextinity.dam.file.replaceFile", defaultMessage: "Replace File" })}
            </Button>
            <input type="file" hidden {...getInputProps()} ref={fileInputRef} />
        </>
    );
}
