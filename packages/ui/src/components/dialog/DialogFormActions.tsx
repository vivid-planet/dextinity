import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { Button, type ButtonProps } from "../button/Button";
import styles from "./DialogFormActions.module.scss";

export interface DialogFormActionsLabels {
    /** The button that closes the dialog without submitting. */
    cancel: string;
}

const defaultLabels: DialogFormActionsLabels = {
    cancel: "Cancel",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DialogFormActionsOwnerState = {
    submitting: boolean;
};

export interface DialogFormActionsSlotProps {
    /** Props for the `cancelButton` slot. */
    cancelButton?: Partial<ButtonProps>;
    /** Props for the `submitButton` slot. */
    submitButton?: Partial<ButtonProps>;
}

export interface DialogFormActionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The `id` of the dialog's `form`; the submit button submits it from the footer, outside the form element. */
    formId: string;
    /** The submitting action, as a verb, e.g. "Create" or "Save". */
    submitLabel: string;
    /** Called when Cancel is clicked; close the dialog there. Without it, there is no Cancel button. */
    onCancel?: () => void;
    /**
     * Shows a spinner in the submit button and disables both buttons while the form is submitted. Pair it with `dismissible={false}`
     * on the `Dialog`.
     *
     * @defaultValue `false`
     */
    submitting?: boolean;
    /**
     * Prevents submitting, e.g. until something was changed.
     *
     * @defaultValue `false`
     */
    submitDisabled?: boolean;
    /** Further actions at the start of the footer, e.g. a destructive "Delete". */
    secondaryActions?: ReactNode;
    /** The built-in texts. */
    labels?: Partial<DialogFormActionsLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: DialogFormActionsSlotProps;
}

/**
 * The footer of a `Dialog` that holds a form: Cancel and a submit button wired to the form by its `id`, so the form element stays in the
 * dialog's content and the form library keeps handling the submit.
 */
export const DialogFormActions = forwardRef<HTMLDivElement, DialogFormActionsProps>(function DialogFormActions(
    {
        formId,
        submitLabel,
        onCancel,
        submitting = false,
        submitDisabled = false,
        secondaryActions,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: DialogFormActionsOwnerState = { submitting };

    return (
        <div {...restProps} ref={ref} data-submitting={ownerState.submitting ? "" : undefined} className={clsx(styles.root, className)}>
            {secondaryActions != null && <div className={styles.secondaryActions}>{secondaryActions}</div>}
            {onCancel != null && (
                <Button variant="text" color="secondary" disabled={ownerState.submitting} {...slotProps?.cancelButton} onClick={onCancel}>
                    {labels.cancel}
                </Button>
            )}
            <Button disabled={submitDisabled} loading={ownerState.submitting} {...slotProps?.submitButton} type="submit" form={formId}>
                {submitLabel}
            </Button>
        </div>
    );
});
