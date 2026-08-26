import { messages } from "@dextinity/admin";
import {
    // eslint-disable-next-line no-restricted-imports
    Button,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

interface Props {
    open: boolean;
    onClose: () => void;
    error: ReactNode;
}

const CannotPasteBlockDialog = ({ open, onClose, error }: Props) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                <FormattedMessage id="dextinity.blocks.cannotPasteBlock.title" defaultMessage="Can't paste block" />
            </DialogTitle>
            <DialogContent>{error}</DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="info">
                    <FormattedMessage {...messages.ok} />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export { CannotPasteBlockDialog };
