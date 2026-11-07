import type { FileUploadFile } from "@dextinity/ui";
import { FileUploadField, type FileUploadFieldProps } from "@dextinity/ui-react-final-form";
import { type ReactNode, useRef } from "react";
import { useIntl } from "react-intl";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import type { GQLFinalFormFileUploadDownloadableFragment, GQLFinalFormFileUploadFragment } from "./FinalFormFileUpload.generated";

type PublicFileUpload = GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment;

interface CommonProps {
    /** Where the files are uploaded to. @defaultValue `${apiUrl}/file-uploads/upload` */
    uploadEndpoint?: string;
    /**
     * Seconds after which the API deletes an uploaded file. Leaving it out takes the default of the API's `FileUploadsModule`; without
     * one, the files are kept.
     */
    expiresIn?: number;
}

export type SinglePublicFileUploadFieldProps = Omit<FileUploadFieldProps<PublicFileUpload | null>, "onUpload" | "multiple" | "maxFiles"> &
    CommonProps & {
        multiple?: false;
    };

export type MultiplePublicFileUploadFieldProps = Omit<FileUploadFieldProps<PublicFileUpload[]>, "onUpload" | "multiple"> &
    CommonProps & {
        /** Allows several files; the value is then a list, empty for none. */
        multiple: true;
    };

export type PublicFileUploadFieldProps = SinglePublicFileUploadFieldProps | MultiplePublicFileUploadFieldProps;

interface UploadResponse {
    id?: string;
    name?: string;
    size?: number;
    downloadUrl?: string;
    message?: string;
}

class PublicFileUploadError extends Error {}

function isDownloadable(file: PublicFileUpload): file is GQLFinalFormFileUploadDownloadableFragment {
    return "downloadUrl" in file && file.downloadUrl != null;
}

/**
 * A React Final Form field to upload files to the API's public file uploads (`FileUploadsModule`), built with `@dextinity/ui`: drop or
 * choose files, see the upload progress, remove files. Its value is a `GQLFinalFormFileUploadFragment` or `null`; with `multiple`, a list
 * of them. Query the files with `finalFormFileUploadFragment`, or `finalFormFileUploadDownloadableFragment` to link them.
 */
export function PublicFileUploadField({ uploadEndpoint, expiresIn, labels, ...props }: PublicFileUploadFieldProps): ReactNode {
    const intl = useIntl();
    const { apiUrl } = useDextinityConfig();
    const knownFiles = useRef(new Map<string, PublicFileUpload>());

    const toPublicFileUpload = (file: FileUploadFile): PublicFileUpload =>
        knownFiles.current.get(file.id) ?? { id: file.id, name: file.name, size: file.size ?? 0 };

    const toFileUploadFile = (file: PublicFileUpload): FileUploadFile => {
        knownFiles.current.set(file.id, file);
        return {
            id: file.id,
            name: file.name,
            size: file.size,
            url: isDownloadable(file) ? `${apiUrl}${file.downloadUrl}` : undefined,
            thumbnailUrl: "imageUrl" in file && file.imageUrl ? `${apiUrl}${file.imageUrl}` : undefined,
        };
    };

    const upload = async (file: File, { onProgress, signal }: { onProgress: (progress: number | null) => void; signal: AbortSignal }) => {
        onProgress(null);
        const formData = new FormData();
        formData.append("file", file);
        if (expiresIn) {
            formData.append("expiresIn", expiresIn.toString());
        }
        const response = await fetch(uploadEndpoint ?? `${apiUrl}/file-uploads/upload`, { method: "POST", body: formData, signal });
        const body: UploadResponse = await response.json().catch(() => ({}));
        if (!response.ok || body.id == null || body.name == null) {
            throw new PublicFileUploadError(
                body.message === "Unsupported mime type"
                    ? intl.formatMessage({ id: "dextinity.publicFileUpload.unsupportedType", defaultMessage: "This file type isn't allowed." })
                    : intl.formatMessage({ id: "dextinity.publicFileUpload.failed", defaultMessage: "The upload failed." }),
            );
        }
        const uploadedFile = { id: body.id, name: body.name, size: body.size ?? file.size };
        knownFiles.current.set(uploadedFile.id, body.downloadUrl ? { ...uploadedFile, downloadUrl: body.downloadUrl, imageUrl: null } : uploadedFile);
        return { ...uploadedFile, url: body.downloadUrl ? `${apiUrl}${body.downloadUrl}` : undefined };
    };

    const sharedProps = {
        onUpload: upload,
        getErrorMessage: (error: unknown) => (error instanceof PublicFileUploadError ? error.message : undefined),
        labels: {
            remove: intl.formatMessage({ id: "dextinity.publicFileUpload.remove", defaultMessage: "Remove" }),
            cancel: intl.formatMessage({ id: "dextinity.publicFileUpload.cancel", defaultMessage: "Cancel upload" }),
            retry: intl.formatMessage({ id: "dextinity.publicFileUpload.retry", defaultMessage: "Try again" }),
            dismiss: intl.formatMessage({ id: "dextinity.publicFileUpload.dismiss", defaultMessage: "Dismiss" }),
            rejectedType: intl.formatMessage({ id: "dextinity.publicFileUpload.rejectedType", defaultMessage: "This file type isn't allowed." }),
            rejectedSize: intl.formatMessage({ id: "dextinity.publicFileUpload.rejectedSize", defaultMessage: "This file is too large." }),
            rejectedCount: intl.formatMessage({ id: "dextinity.publicFileUpload.rejectedCount", defaultMessage: "No more files can be added." }),
            uploadFailed: intl.formatMessage({ id: "dextinity.publicFileUpload.failed", defaultMessage: "The upload failed." }),
            ...labels,
        },
    };

    if (props.multiple) {
        const { multiple: _multiple, ...multipleProps } = props;
        return (
            <FileUploadField<PublicFileUpload[]>
                {...multipleProps}
                {...sharedProps}
                multiple
                format={(files) => (files ?? []).map(toFileUploadFile)}
                parse={(files) => files.map(toPublicFileUpload)}
                isEqual={(files, otherFiles) => haveSameIds(files ?? [], otherFiles ?? [])}
            />
        );
    }

    const { multiple: _multiple, ...singleProps } = props;
    return (
        <FileUploadField<PublicFileUpload | null>
            {...singleProps}
            {...sharedProps}
            format={(file) => (file ? [toFileUploadFile(file)] : [])}
            parse={(files) => (files.length > 0 ? toPublicFileUpload(files[files.length - 1]) : null)}
            isEqual={(file, otherFile) => file?.id === otherFile?.id}
        />
    );
}

// The download URLs of the API are signed anew on every query, so only the ids tell whether the files changed
function haveSameIds(files: PublicFileUpload[], otherFiles: PublicFileUpload[]) {
    return files.length === otherFiles.length && files.every((file, index) => file.id === otherFiles[index].id);
}
