import { CancelButton, DeleteButton, messages } from "@dextinity/admin";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogTitle,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

import * as sc from "./ConfirmDeleteDialog.sc";

interface ConfirmDeleteDialogProps {
    open: boolean;
    onCloseDialog: (confirmed: boolean) => void;
    itemType: "file" | "folder" | "selected_items";
    name?: string;
}

export const ConfirmDeleteDialog = ({ open, onCloseDialog, name, itemType }: ConfirmDeleteDialogProps) => {
    return (
        <Dialog open={open} onClose={() => onCloseDialog(false)}>
            <DialogTitle>
                <FormattedMessage id="dextinity.dam.delete.deleteSelection" defaultMessage="Delete selection?" />
            </DialogTitle>
            <sc.ConfirmDialogContent>
                {/* @TODO: Only show warning if there are dependencies */}
                <sc.WarningWrapper>
                    <sc.WarningIcon />
                    <sc.WarningTextWrapper>
                        <sc.WarningHeading>
                            <FormattedMessage {...messages.warning} />
                        </sc.WarningHeading>
                        <sc.WarningText>
                            {itemType === "file" && (
                                <FormattedMessage
                                    id="dextinity.dam.delete.file.mightHaveDependenciesWarning"
                                    defaultMessage="The file {name} might be used somewhere on the website. If you delete this file, it will disappear from all pages."
                                    values={{ name: name }}
                                />
                            )}
                            {itemType === "folder" && (
                                <FormattedMessage
                                    id="dextinity.dam.delete.folder.mightHaveDependenciesWarning"
                                    defaultMessage="All files inside the folder {name} will also be removed. These files might be used somewhere on the website. If you delete them, they will disappear from all pages."
                                    values={{ name: name }}
                                />
                            )}
                            {itemType === "selected_items" && (
                                <FormattedMessage
                                    id="dextinity.dam.delete.selectedItems.mightHaveDependenciesWarning"
                                    defaultMessage="All selected files and folders (including their content) will be removed. Some of the files might be used on the website. If you delete them, they will disappear from all pages."
                                />
                            )}
                        </sc.WarningText>
                    </sc.WarningTextWrapper>
                </sc.WarningWrapper>
                <strong>
                    {itemType === "file" && (
                        <FormattedMessage id="dextinity.dam.delete.file.areYouSure" defaultMessage="Do you still want to delete this file?" />
                    )}
                    {itemType === "folder" && (
                        <FormattedMessage id="dextinity.dam.delete.folder.areYouSure" defaultMessage="Do you still want to delete this folder?" />
                    )}
                    {itemType === "selected_items" && (
                        <FormattedMessage
                            id="dextinity.dam.delete.selectedItems.areYouSure"
                            defaultMessage="Do you still want to delete all selected items?"
                        />
                    )}
                </strong>
            </sc.ConfirmDialogContent>
            <DialogActions>
                <CancelButton onClick={() => onCloseDialog(false)} />
                <DeleteButton
                    onClick={() => {
                        onCloseDialog(true);
                    }}
                    autoFocus={true}
                >
                    <FormattedMessage id="dextinity.dam.delete.deleteNow" defaultMessage="Delete Now" />
                </DeleteButton>
            </DialogActions>
        </Dialog>
    );
};
