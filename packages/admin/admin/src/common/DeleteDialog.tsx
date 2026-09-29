import { Delete as DeleteIcon, Remove as RemoveIcon, WarningSolid } from "@dextinity/admin-icons";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

import { messages } from "../messages";
import { CancelButton } from "./buttons/cancel/CancelButton";
import { FeedbackButton } from "./buttons/feedback/FeedbackButton";

interface DeleteDialogProps {
    dialogOpen: boolean;
    deleteType?: "delete" | "remove";
    deleteCount?: number;
    onDelete: () => Promise<void>;
    onCancel: () => void;
}

export const DeleteDialog = (props: DeleteDialogProps) => {
    const { dialogOpen, deleteType = "delete", deleteCount, onDelete, onCancel } = props;

    return (
        <Dialog open={dialogOpen} onClose={onCancel} maxWidth="sm">
            <DialogTitle>
                {deleteType === "delete" ? (
                    <FormattedMessage id="dextinity.table.deleteDialog.title" defaultMessage="Attention. Please confirm." />
                ) : (
                    <FormattedMessage id="dextinity.common.deleteDialog.titleRemove" defaultMessage="Please confirm." />
                )}
            </DialogTitle>
            <DialogContent sx={{ gap: (theme) => theme.spacing(2), display: "flex", alignItems: "center" }}>
                <WarningSolid color="error" />
                {deleteType === "delete" ? (
                    deleteCount !== undefined && deleteCount > 1 ? (
                        <FormattedMessage
                            id="dextinity.table.deleteDialog.contentMultiple"
                            defaultMessage="You are about to delete {count} items permanently."
                            values={{ count: deleteCount }}
                        />
                    ) : (
                        <FormattedMessage id="dextinity.table.deleteDialog.content" defaultMessage="You are about to delete this item permanently." />
                    )
                ) : (
                    <FormattedMessage id="dextinity.common.deleteDialog.contentRemove" defaultMessage="You are about to remove this item." />
                )}
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={onCancel} />
                <FeedbackButton
                    startIcon={deleteType === "delete" ? <DeleteIcon /> : <RemoveIcon />}
                    onClick={onDelete}
                    variant="destructive"
                    tooltipErrorMessage={
                        deleteType === "delete" ? (
                            <FormattedMessage id="dextinity.common.deleteFailed" defaultMessage="Failed to delete" />
                        ) : (
                            <FormattedMessage id="dextinity.common.removeFailed" defaultMessage="Failed to remove" />
                        )
                    }
                >
                    <FormattedMessage {...(deleteType === "delete" ? messages.delete : messages.remove)} />
                </FeedbackButton>
            </DialogActions>
        </Dialog>
    );
};
