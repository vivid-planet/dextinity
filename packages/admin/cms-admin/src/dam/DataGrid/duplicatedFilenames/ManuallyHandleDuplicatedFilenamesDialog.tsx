import { Banner, Button, Dialog, Icon } from "@dextinity/ui";
import type { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import type { FilenameData } from "./ManualDuplicatedFilenamesHandler";
import { ActionDescriptions, Filename, Filenames } from "./ManuallyHandleDuplicatedFilenamesDialog.sc";

interface DuplicateFilenameDialogProps {
    open: boolean;
    filenameData: FilenameData[];
    onSkip: () => void;
    onUpload: () => void;
    onReplace: () => void;
}

const formatStrong = (chunks: ReactNode[]) => <strong>{chunks}</strong>;

export function ManuallyHandleDuplicatedFilenamesDialog({ open, filenameData, onSkip, onUpload, onReplace }: DuplicateFilenameDialogProps) {
    const intl = useIntl();
    const count = filenameData.length;

    return (
        <Dialog
            open={open}
            onOpenChange={() => undefined}
            role="alertdialog"
            dismissible={false}
            hideCloseButton
            title={intl.formatMessage(
                { id: "dextinity.dam.duplicateFilenameDialog.title", defaultMessage: "Duplicate {count, plural, one {filename} other {filenames}}" },
                { count },
            )}
            description={intl.formatMessage(
                {
                    id: "dextinity.dam.duplicateFilenameDialog.actionAlert",
                    defaultMessage:
                        "The following {count, plural, one {filename} other {filenames}} already {count, plural, one {exists} other {exist}}. Please choose an action:",
                },
                { count },
            )}
            footer={
                <>
                    <Button variant="text" color="secondary" startIcon={<Icon name="forward" />} onClick={onSkip}>
                        <FormattedMessage
                            id="dextinity.dam.duplicateFilenameDialog.action.skip"
                            defaultMessage="Skip {count, plural, one {file} other {files}}"
                            values={{ count }}
                        />
                    </Button>
                    <Button variant="outlined" color="secondary" startIcon={<Icon name="swap" />} onClick={onReplace}>
                        <FormattedMessage
                            id="dextinity.dam.duplicateFilenameDialog.action.replaceFiles"
                            defaultMessage="Replace {count, plural, one {file} other {files}}"
                            values={{ count }}
                        />
                    </Button>
                    <Button startIcon={<Icon name="copy" />} onClick={onUpload}>
                        <FormattedMessage
                            id="dextinity.dam.duplicateFilenameDialog.action.uploadAsCopy"
                            defaultMessage="Upload as {count, plural, one {copy} other {copies}}"
                            values={{ count }}
                        />
                    </Button>
                </>
            }
        >
            <Filenames
                aria-label={intl.formatMessage({ id: "dextinity.dam.duplicateFilenameDialog.filenames", defaultMessage: "Duplicate filenames" })}
            >
                {filenameData.map((data) => (
                    <Filename key={`${data.folderId ?? ""}/${data.name}`}>{data.name}</Filename>
                ))}
            </Filenames>
            <Banner tone="info">
                <ActionDescriptions>
                    <li>
                        <FormattedMessage
                            id="dextinity.dam.duplicateFilenameDialog.skipDescription"
                            defaultMessage="<strong>Skip:</strong> Skip uploading duplicates. All other files will be uploaded as usual."
                            values={{ strong: formatStrong }}
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id="dextinity.dam.duplicateFilenameDialog.replaceDescription"
                            defaultMessage="<strong>Replace:</strong> Replace existing files with duplicates. <strong>Attention:</strong> This will not affect image cropping settings."
                            values={{ strong: formatStrong }}
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id="dextinity.dam.duplicateFilenameDialog.saveAsCopyDescription"
                            defaultMessage="<strong>Save as copy:</strong> Upload duplicates as new files with “copy” added to the end of the file names."
                            values={{ strong: formatStrong }}
                        />
                    </li>
                </ActionDescriptions>
            </Banner>
        </Dialog>
    );
}
