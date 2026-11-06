import { messages } from "@dextinity/admin";
import { Button, Dialog } from "@dextinity/ui";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";

interface Props {
    open: boolean;
    onClose: () => void;
    error: ReactNode;
}

const CannotPasteBlockDialog = ({ open, onClose, error }: Props) => {
    const intl = useIntl();

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
            role="alertdialog"
            size="small"
            title={intl.formatMessage({ id: "dextinity.blocks.cannotPasteBlock.title", defaultMessage: "Can't paste block" })}
            footer={
                <Button variant="contained" color="primary" onClick={onClose}>
                    {intl.formatMessage(messages.ok)}
                </Button>
            }
        >
            {error}
        </Dialog>
    );
};

export { CannotPasteBlockDialog };
