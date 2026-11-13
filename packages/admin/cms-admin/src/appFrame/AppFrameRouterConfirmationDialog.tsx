import { messages, useRouterConfirmationDialog } from "@dextinity/admin";
import { ConfirmDialog, Icon } from "@dextinity/ui";
import { useState } from "react";
import { useIntl } from "react-intl";

/**
 * The unsaved-changes dialog of `RouterPrompt`s (e.g. of forms and editors) as a `ConfirmDialog` of `@dextinity/ui`, in place of the
 * router's MUI `RouterConfirmationDialog`.
 */
export function AppFrameRouterConfirmationDialog() {
    const intl = useIntl();
    const dialog = useRouterConfirmationDialog();
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await dialog.onSave();
        } finally {
            setSaving(false);
        }
    };

    const defaultMessage = intl.formatMessage({
        id: "dextinity.unsavedChanges.description",
        defaultMessage: "You have unsaved changes. Save them before leaving, or discard them.",
    });
    const isGenericMessage = dialog.message === "" || dialog.message === intl.formatMessage(messages.saveUnsavedChanges);
    const discardLabel = intl.formatMessage({ id: "dextinity.unsavedChanges.discard", defaultMessage: "Discard changes" });

    return (
        <ConfirmDialog
            open={dialog.open}
            onOpenChange={(open) => {
                if (!open && !saving) {
                    void dialog.onCancel();
                }
            }}
            title={intl.formatMessage({ id: "dextinity.unsavedChanges.title", defaultMessage: "Save your changes?" })}
            description={isGenericMessage ? defaultMessage : dialog.message}
            loading={saving}
            labels={{ cancel: intl.formatMessage({ id: "dextinity.unsavedChanges.cancel", defaultMessage: "Stay" }) }}
            {...(dialog.showSaveButton
                ? {
                      confirmLabel: intl.formatMessage({ id: "dextinity.unsavedChanges.save", defaultMessage: "Save and leave" }),
                      confirmIcon: <Icon name="check" />,
                      onConfirm: () => void save(),
                      secondaryLabel: discardLabel,
                      onSecondary: () => void dialog.onDiscard(),
                  }
                : {
                      confirmLabel: discardLabel,
                      confirmIcon: <Icon name="trash" />,
                      onConfirm: () => void dialog.onDiscard(),
                      tone: "danger" as const,
                  })}
        />
    );
}
