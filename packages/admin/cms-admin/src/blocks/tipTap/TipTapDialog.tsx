import { messages } from "@dextinity/admin";
import { Button, Dialog, DialogFormActions } from "@dextinity/ui";
import { type FormEvent, type PropsWithChildren, useId } from "react";
import { useIntl } from "react-intl";

interface TipTapDialogProps {
    title: string;
    onSubmit: () => void;
    onClose: () => void;
    /** Shows a remove action at the start of the footer. */
    onRemove?: () => void;
    removeLabel?: string;
}

/**
 * The dialog the editor edits a link or a child block in. Its content is the block's admin component, which applies its changes to the
 * dialog's own state; OK hands them to the editor.
 */
export function TipTapDialog({ title, onSubmit, onClose, onRemove, removeLabel, children }: PropsWithChildren<TipTapDialogProps>) {
    const intl = useIntl();
    const formId = useId();

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // React lets submit events of forms in portals, e.g. a dialog of the block, bubble to this form
        if (event.target !== event.currentTarget) {
            return;
        }
        onSubmit();
        onClose();
    };

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title={title}
            labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
            footer={
                <DialogFormActions
                    formId={formId}
                    submitLabel={intl.formatMessage(messages.ok)}
                    onCancel={onClose}
                    labels={{ cancel: intl.formatMessage(messages.cancel) }}
                    secondaryActions={
                        onRemove && (
                            <Button
                                variant="text"
                                color="error"
                                onClick={() => {
                                    onRemove();
                                    onClose();
                                }}
                            >
                                {removeLabel ?? intl.formatMessage(messages.delete)}
                            </Button>
                        )
                    }
                />
            }
        >
            <form id={formId} onSubmit={handleSubmit} noValidate>
                {children}
            </form>
        </Dialog>
    );
}
