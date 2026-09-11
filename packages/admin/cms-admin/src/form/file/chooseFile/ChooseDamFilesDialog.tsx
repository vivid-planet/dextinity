import { Button } from "@dextinity/admin";
import { DialogActions } from "@mui/material";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import type { GQLDamFileTableFragment } from "../../../dam/DataGrid/FolderDataGrid";
import DamItemLabel from "../../../dam/DataGrid/label/DamItemLabel";
import type { RenderDamLabelOptions } from "../../../dam/DataGrid/label/DamItemLabelColumn";
import { BaseChooseDamFileDialog } from "./BaseChooseDamFileDialog";

interface ChooseDamFilesDialogProps {
    onClose: () => void;
    onConfirm: (fileIds: string[]) => void | Promise<void>;
    initialFileIds: string[];
    allowedMimetypes?: string[];
}

const FileLabel = ({ file, matches, showLicenseWarnings }: { file: GQLDamFileTableFragment } & RenderDamLabelOptions) => (
    <DamItemLabel asset={file} matches={matches} showLicenseWarnings={showLicenseWarnings} />
);

export const ChooseDamFilesDialog = ({ onClose, onConfirm, initialFileIds, allowedMimetypes }: ChooseDamFilesDialogProps) => {
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>(initialFileIds);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm(selectedFileIds);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleClose = () => {
        if (isConfirming) {
            return;
        }
        onClose();
    };

    return (
        <BaseChooseDamFileDialog
            open
            onClose={handleClose}
            title={<FormattedMessage id="dextinity.form.file.selectFiles" defaultMessage="Select files from DAM" />}
            stateKey="choose-files-dam-location"
            allowedMimetypes={allowedMimetypes}
            renderFileLabel={(file, options) => <FileLabel file={file} {...options} />}
            hideMultiselect={false}
            disableFolderSelection={true}
            keepNonExistentRowsSelected={true}
            initialFileIds={selectedFileIds}
            onFileIdsChange={setSelectedFileIds}
            actions={
                <DialogActions>
                    <Button variant="textLight" onClick={handleClose} disabled={isConfirming}>
                        <FormattedMessage id="dextinity.generic.cancel" defaultMessage="Cancel" />
                    </Button>
                    <Button variant="primary" onClick={handleConfirm} disabled={selectedFileIds.length === 0 || isConfirming}>
                        <FormattedMessage
                            id="dextinity.form.file.applyFileSelection"
                            defaultMessage="Select {count, plural, one {# file} other {# files}}"
                            values={{ count: selectedFileIds.length }}
                        />
                    </Button>
                </DialogActions>
            }
        />
    );
};
