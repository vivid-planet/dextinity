import { messages } from "@dextinity/admin";
import { Button, Dialog } from "@dextinity/ui";
import { useIntl } from "react-intl";

import { ErrorMessages, FileErrors, FileName, FilePath, Files } from "./FileUploadErrorDialog.sc";
import type { FileUploadValidationError } from "./useDamFileUpload";

interface FileUploadErrorDialogProps {
    open?: boolean;
    onClose: () => void;
    validationErrors?: FileUploadValidationError[];
}

function hasFolderPath(file: FileUploadValidationError["file"]) {
    return file.path != null && file.path.replace(/^\.?\//, "") !== file.name;
}

export const FileUploadErrorDialog = ({ open = false, onClose, validationErrors }: FileUploadErrorDialogProps) => {
    const intl = useIntl();
    if (validationErrors === undefined) {
        return null;
    }

    const errorsPerFile = new Map<string, FileUploadValidationError[]>();
    for (const error of validationErrors) {
        const fileId = error.file.path ?? error.file.name;
        errorsPerFile.set(fileId, [...(errorsPerFile.get(fileId) ?? []), error]);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
            size="large"
            title={intl.formatMessage({ id: "dextinity.pages.dam.uploadErrors", defaultMessage: "Upload errors" })}
            description={intl.formatMessage({
                id: "dextinity.pages.dam.followingFilesCouldNotBeUploaded",
                defaultMessage: "Following files could not be uploaded:",
            })}
            labels={{ close: intl.formatMessage(messages.close) }}
            footer={<Button onClick={onClose}>{intl.formatMessage(messages.ok)}</Button>}
        >
            <Files>
                {Array.from(errorsPerFile.entries()).map(([fileId, errorsOfFile]) => (
                    <FileErrors key={fileId}>
                        <div>
                            <FileName>{errorsOfFile[0].file.name}</FileName>
                            {hasFolderPath(errorsOfFile[0].file) && <FilePath>{errorsOfFile[0].file.path}</FilePath>}
                        </div>
                        <ErrorMessages>
                            {errorsOfFile.map((error, index) => (
                                // The messages of a file have no id and never change order

                                <li key={index}>{error.message}</li>
                            ))}
                        </ErrorMessages>
                    </FileErrors>
                ))}
            </Files>
        </Dialog>
    );
};
