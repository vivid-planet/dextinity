import { ConfirmDialog, Icon } from "@dextinity/ui";
import { useIntl } from "react-intl";

interface DeleteEntityDialogProps {
    /** The name of the entry to delete, `undefined` while the dialog is closed. */
    entryName: string | undefined;
    description?: string;
    deleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteEntityDialog({ entryName, description, deleting, onCancel, onConfirm }: DeleteEntityDialogProps) {
    const intl = useIntl();
    return (
        <ConfirmDialog
            open={entryName !== undefined}
            onOpenChange={(open) => {
                if (!open && !deleting) {
                    onCancel();
                }
            }}
            tone="danger"
            title={intl.formatMessage({ id: "uiDemo.productsCommon.deleteDialog.title", defaultMessage: "Delete “{name}”?" }, { name: entryName })}
            description={
                description ?? intl.formatMessage({ id: "uiDemo.productsCommon.deleteDialog.description", defaultMessage: "This can't be undone." })
            }
            confirmLabel={intl.formatMessage({ id: "uiDemo.productsCommon.delete", defaultMessage: "Delete" })}
            confirmIcon={<Icon name="trash" />}
            onConfirm={onConfirm}
            loading={deleting}
            labels={{ cancel: intl.formatMessage({ id: "uiDemo.productsCommon.cancel", defaultMessage: "Cancel" }) }}
        />
    );
}
