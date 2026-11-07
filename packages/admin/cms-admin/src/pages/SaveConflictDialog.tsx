import { ConfirmDialog, Icon } from "@dextinity/ui";
import { useIntl } from "react-intl";

interface SaveConflictDialogProps {
    open: boolean;
    onClosePressed: () => void;
    onDiscardChangesPressed: () => void;
}

function SaveConflictDialog({ open, onClosePressed, onDiscardChangesPressed }: SaveConflictDialogProps) {
    const intl = useIntl();

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClosePressed();
                }
            }}
            tone="danger"
            title={intl.formatMessage({ id: "dextinity.saveConflictDialog.heading", defaultMessage: "Someone else changed this content" })}
            description={intl.formatMessage({
                id: "dextinity.saveConflictDialog.description",
                defaultMessage:
                    "It was saved by someone else while you were editing, so you can't save without overwriting their changes. Open their version in a new tab and make your changes there, or discard your changes.",
            })}
            secondaryLabel={intl.formatMessage({
                id: "dextinity.saveConflictDialog.actionButtons.openOtherVersion",
                defaultMessage: "Open their version",
            })}
            onSecondary={() => {
                onClosePressed();
                window.open(window.location.href, "_blank");
            }}
            confirmLabel={intl.formatMessage({
                id: "dextinity.saveConflictDialog.actionButtons.discardChanges",
                defaultMessage: "Discard your changes",
            })}
            confirmIcon={<Icon name="delete" />}
            onConfirm={() => {
                onClosePressed();
                onDiscardChangesPressed();
            }}
            labels={{ cancel: intl.formatMessage({ id: "dextinity.saveConflictDialog.actionButtons.close", defaultMessage: "Close" }) }}
        />
    );
}

export { SaveConflictDialog };
