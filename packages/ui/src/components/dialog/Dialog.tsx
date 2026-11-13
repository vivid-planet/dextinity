import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { FieldContextReset } from "../field/fieldContext";
import { Icon } from "../icon/Icon";
import { IconButton, type IconButtonProps } from "../iconButton/IconButton";
import styles from "./Dialog.module.scss";

type DialogSize = "small" | "default" | "large";
type DialogRole = "dialog" | "alertdialog";

const defaultLabels = {
    close: "Close",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DialogOwnerState = {
    size: DialogSize;
    role: DialogRole;
    dismissible: boolean;
};

export interface DialogSlotProps {
    /** Props for the `backdrop` slot, which dims the page. */
    backdrop?: SlotPropsValue<DialogOwnerState, typeof BaseDialog.Backdrop>;
    /** Props for the `viewport` slot, which centers the dialog. */
    viewport?: SlotPropsValue<DialogOwnerState, typeof BaseDialog.Viewport>;
    /** Props for the `header` slot. */
    header?: SlotPropsValue<DialogOwnerState, "div">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<DialogOwnerState, typeof BaseDialog.Title>;
    /** Props for the `description` slot. */
    description?: SlotPropsValue<DialogOwnerState, typeof BaseDialog.Description>;
    /** Props for the `closeButton` slot. */
    closeButton?: Partial<IconButtonProps>;
    /** Props for the `body` slot. */
    body?: SlotPropsValue<DialogOwnerState, "div">;
    /** Props for the `footer` slot. */
    footer?: SlotPropsValue<DialogOwnerState, "div">;
}

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "title" | "role"> {
    /** Whether the dialog is open. */
    open: boolean;
    /** Called when the close button, Escape, or a click on the backdrop requests to close the dialog, unless it isn't `dismissible`. */
    onOpenChange: (open: boolean) => void;
    /** What the dialog is about, as its heading. */
    title: string;
    /** A sentence under the title, e.g. the consequence of the decision. */
    description?: string;
    /** The content, e.g. a short form. */
    children?: ReactNode;
    /** The actions, as `Button`s: secondary ones first, the primary one last. */
    footer?: ReactNode;
    /**
     * The width: `small` (440 px) for questions, `default` (640 px), `large` (960 px).
     *
     * @defaultValue `"default"`
     */
    size?: DialogSize;
    /**
     * `alertdialog` for a question that needs an answer: it doesn't close on a click on the backdrop. Prefer `ConfirmDialog`.
     *
     * @defaultValue `"dialog"`
     */
    role?: DialogRole;
    /**
     * Hides the close button in the corner; Escape still closes the dialog.
     *
     * @defaultValue `false`
     */
    hideCloseButton?: boolean;
    /**
     * Whether Escape, a click on the backdrop, and the close button close the dialog. Turn it off while the dialog's task runs, e.g.
     * while saving, so it can't be closed halfway; the footer's actions still can.
     *
     * @defaultValue `true`
     */
    dismissible?: boolean;
    /** The element focused when the dialog opens. Without it, the first focusable element gets focus. */
    initialFocus?: RefObject<HTMLElement | null>;
    /** Built-in texts, e.g. the close button's accessible name. */
    labels?: Partial<typeof defaultLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: DialogSlotProps;
}

/**
 * A modal window for a decision or a short task that needs full attention. Focus stays in the dialog and returns to the
 * trigger on close.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
    {
        open,
        onOpenChange,
        title,
        description,
        children,
        footer,
        size = "default",
        role = "dialog",
        hideCloseButton = false,
        dismissible = true,
        initialFocus,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: DialogOwnerState = { size, role, dismissible };
    const labels = { ...defaultLabels, ...labelsProp };
    const { anchorRef, container } = useThemePortalContainer<HTMLSpanElement>();
    const Root = ownerState.role === "alertdialog" ? BaseAlertDialog.Root : BaseDialog.Root;

    const backdropProps = resolveSlotProps<DialogOwnerState, typeof BaseDialog.Backdrop, typeof BaseDialog.Backdrop>({
        ownProps: { className: styles.backdrop },
        slotProps: slotProps?.backdrop,
        ownerState,
    });
    const viewportProps = resolveSlotProps<DialogOwnerState, typeof BaseDialog.Viewport, typeof BaseDialog.Viewport>({
        ownProps: { className: styles.viewport },
        slotProps: slotProps?.viewport,
        ownerState,
    });
    const headerProps = resolveSlotProps<DialogOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const titleProps = resolveSlotProps<DialogOwnerState, typeof BaseDialog.Title, typeof BaseDialog.Title>({
        ownProps: { className: styles.title, children: title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const descriptionProps = resolveSlotProps<DialogOwnerState, typeof BaseDialog.Description, typeof BaseDialog.Description>({
        ownProps: { className: styles.description, children: description },
        slotProps: slotProps?.description,
        ownerState,
    });
    const bodyProps = resolveSlotProps<DialogOwnerState, "div", "div">({
        ownProps: { className: styles.body },
        slotProps: slotProps?.body,
        ownerState,
    });
    const footerProps = resolveSlotProps<DialogOwnerState, "div", "div">({
        ownProps: { className: styles.footer },
        slotProps: slotProps?.footer,
        ownerState,
    });

    return (
        <>
            <span ref={anchorRef} hidden />
            <Root
                open={open}
                disablePointerDismissal={!ownerState.dismissible}
                onOpenChange={(nextOpen) => {
                    if (nextOpen || ownerState.dismissible) {
                        onOpenChange(nextOpen);
                    }
                }}
            >
                <BaseDialog.Portal container={container}>
                    <FieldContextReset>
                        <BaseDialog.Backdrop {...backdropProps} />
                        <BaseDialog.Viewport {...viewportProps}>
                            <BaseDialog.Popup
                                {...restProps}
                                ref={ref}
                                initialFocus={initialFocus}
                                data-size={ownerState.size}
                                data-dismissible={ownerState.dismissible ? "" : undefined}
                                className={clsx(styles.root, className)}
                            >
                                <div {...headerProps}>
                                    <BaseDialog.Title {...titleProps} />
                                    {description != null && <BaseDialog.Description {...descriptionProps} />}
                                </div>
                                {children != null && <div {...bodyProps}>{children}</div>}
                                {footer != null && <div {...footerProps}>{footer}</div>}
                                {!hideCloseButton && (
                                    <BaseDialog.Close
                                        render={
                                            <IconButton
                                                variant="text"
                                                color="secondary"
                                                size="small"
                                                {...slotProps?.closeButton}
                                                disabled={!ownerState.dismissible || slotProps?.closeButton?.disabled}
                                                aria-label={labels.close}
                                                className={clsx(styles.closeButton, slotProps?.closeButton?.className)}
                                            >
                                                <Icon name="close" />
                                            </IconButton>
                                        }
                                    />
                                )}
                            </BaseDialog.Popup>
                        </BaseDialog.Viewport>
                    </FieldContextReset>
                </BaseDialog.Portal>
            </Root>
        </>
    );
});
