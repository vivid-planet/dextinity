import { ConfirmDialog } from "@dextinity/ui";
import { useIntl } from "react-intl";

interface UnsavedChangesDialogProps {
    open: boolean;
    onCancel: () => void;
    onDiscard: () => void;
    onSave: () => Promise<void>;
}

export function UnsavedChangesDialog({ open, onCancel, onDiscard, onSave }: UnsavedChangesDialogProps) {
    const intl = useIntl();
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onCancel();
                }
            }}
            title={intl.formatMessage({ id: "uiDemo.productsCommon.unsavedChanges.title", defaultMessage: "Unsaved changes" })}
            description={intl.formatMessage({
                id: "uiDemo.productsCommon.unsavedChanges.description",
                defaultMessage: "Save the changes before you continue?",
            })}
            secondaryLabel={intl.formatMessage({ id: "uiDemo.productsCommon.unsavedChanges.discard", defaultMessage: "Discard" })}
            onSecondary={onDiscard}
            confirmLabel={intl.formatMessage({ id: "uiDemo.productsCommon.unsavedChanges.save", defaultMessage: "Save and continue" })}
            onConfirm={() => void onSave()}
            labels={{ cancel: intl.formatMessage({ id: "uiDemo.productsCommon.cancel", defaultMessage: "Cancel" }) }}
        />
    );
}
