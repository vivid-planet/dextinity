import { clsx } from "clsx";
import { forwardRef, type ReactNode } from "react";

import { Button, type ButtonProps } from "../button/Button";
import { Dialog, type DialogProps } from "../dialog/Dialog";
import styles from "./ConfirmDialog.module.scss";

type ConfirmDialogTone = "default" | "danger";

const defaultLabels = {
    cancel: "Cancel",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ConfirmDialogOwnerState = {
    tone: ConfirmDialogTone;
};

export interface ConfirmDialogSlotProps {
    /** Props for the `dialog` slot, e.g. its `slotProps`. */
    dialog?: Partial<Omit<DialogProps, "open" | "onOpenChange" | "title" | "description" | "footer" | "role">>;
    /** Props for the `cancelButton` slot. */
    cancelButton?: Partial<ButtonProps>;
    /** Props for the `secondaryButton` slot. */
    secondaryButton?: Partial<ButtonProps>;
    /** Props for the `confirmButton` slot. */
    confirmButton?: Partial<ButtonProps>;
}

export interface ConfirmDialogProps {
    /** Whether the dialog is open. */
    open: boolean;
    /** Called when Cancel or Escape requests to close the dialog. */
    onOpenChange: (open: boolean) => void;
    /** What happens, as a question, e.g. "Delete “Careers” and 3 subpages?". */
    title: string;
    /** The consequence, in one sentence. */
    description?: string;
    /** Details that help decide, between the description and the actions, e.g. what a deletion takes along. */
    children?: ReactNode;
    /** The confirming action, as a verb, e.g. "Save and continue" or "Delete". */
    confirmLabel: string;
    /** Called when the confirming action is clicked. Close the dialog through `open` once the action is done. */
    onConfirm: () => void;
    /** An icon before the confirming action's label, e.g. `<Icon name="delete" />`. */
    confirmIcon?: ReactNode;
    /** A third option between Cancel and the confirming action, e.g. "Discard". */
    secondaryLabel?: string;
    /** Called when the third option is clicked. */
    onSecondary?: () => void;
    /**
     * `danger` marks the confirming action as destructive.
     *
     * @defaultValue `"default"`
     */
    tone?: ConfirmDialogTone;
    /**
     * Shows a spinner in the confirming action while it runs; meanwhile, the other actions are disabled and the dialog can't be closed.
     *
     * @defaultValue `false`
     */
    loading?: boolean;
    /** Built-in texts, e.g. the cancel button's label. */
    labels?: Partial<typeof defaultLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ConfirmDialogSlotProps;
}

/**
 * Asks before an action that loses data and can't be undone, e.g. leaving with unsaved changes or deleting for good.
 * Prefer doing the action right away and offering Undo in a `Toast`.
 */
export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(function ConfirmDialog(
    {
        open,
        onOpenChange,
        title,
        description,
        children,
        confirmLabel,
        onConfirm,
        confirmIcon,
        secondaryLabel,
        onSecondary,
        tone = "default",
        loading = false,
        labels: labelsProp,
        className,
        slotProps,
    },
    ref,
) {
    const ownerState: ConfirmDialogOwnerState = { tone };
    const labels = { ...defaultLabels, ...labelsProp };
    const danger = ownerState.tone === "danger";

    return (
        <Dialog
            {...slotProps?.dialog}
            ref={ref}
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            role="alertdialog"
            size="small"
            hideCloseButton
            dismissible={!loading}
            data-tone={ownerState.tone}
            className={clsx(styles.root, className)}
            footer={
                <>
                    <Button variant="text" color="secondary" disabled={loading} {...slotProps?.cancelButton} onClick={() => onOpenChange(false)}>
                        {labels.cancel}
                    </Button>
                    {secondaryLabel != null && (
                        <Button variant="outlined" color="secondary" disabled={loading} {...slotProps?.secondaryButton} onClick={onSecondary}>
                            {secondaryLabel}
                        </Button>
                    )}
                    <Button
                        variant={danger ? "outlined" : "contained"}
                        color={danger ? "error" : "primary"}
                        startIcon={confirmIcon}
                        loading={loading}
                        {...slotProps?.confirmButton}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            {children}
        </Dialog>
    );
});
