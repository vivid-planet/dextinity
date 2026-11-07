import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Icon } from "../icon/Icon";
import { IconButton, type IconButtonProps } from "../iconButton/IconButton";
import styles from "./Drawer.module.scss";

type DrawerWidth = "default" | "large";

const defaultLabels = {
    close: "Close",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DrawerOwnerState = {
    width: DrawerWidth;
    modal: boolean;
};

export interface DrawerSlotProps {
    /** Props for the `backdrop` slot, which dims the page behind a modal drawer. */
    backdrop?: SlotPropsValue<DrawerOwnerState, typeof BaseDialog.Backdrop>;
    /** Props for the `header` slot. */
    header?: SlotPropsValue<DrawerOwnerState, "div">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<DrawerOwnerState, typeof BaseDialog.Title>;
    /** Props for the `description` slot. */
    description?: SlotPropsValue<DrawerOwnerState, typeof BaseDialog.Description>;
    /** Props for the `closeButton` slot. */
    closeButton?: Partial<IconButtonProps>;
    /** Props for the `body` slot. */
    body?: SlotPropsValue<DrawerOwnerState, "div">;
    /** Props for the `footer` slot. */
    footer?: SlotPropsValue<DrawerOwnerState, "div">;
}

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "title"> {
    /** Whether the drawer is open. */
    open: boolean;
    /** Called when the close button or Escape requests to close the drawer; for a modal drawer, also a click on the backdrop. */
    onOpenChange: (open: boolean) => void;
    /** What the drawer edits or shows, e.g. "Edit redirect". */
    title: string;
    /** A sentence under the title. */
    description?: string;
    /** The content, usually a form. */
    children: ReactNode;
    /** The actions, as `Button`s, at the bottom. */
    footer?: ReactNode;
    /**
     * `default` (420 px) or `large` (560 px). On narrow screens the drawer takes the full width.
     *
     * @defaultValue `"default"`
     */
    width?: DrawerWidth;
    /**
     * Dims the page and blocks it while the drawer is open. Without it, the page next to the drawer stays usable, e.g. to
     * pick another row of a list.
     *
     * @defaultValue `false`
     */
    modal?: boolean;
    /** The element focused when the drawer opens. Without it, the first focusable element gets focus. */
    initialFocus?: RefObject<HTMLElement | null>;
    /** Built-in texts, e.g. the close button's accessible name. */
    labels?: Partial<typeof defaultLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: DrawerSlotProps;
}

/**
 * A panel at the right edge for editing next to a list, e.g. a redirect. The list stays visible.
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
    {
        open,
        onOpenChange,
        title,
        description,
        children,
        footer,
        width = "default",
        modal = false,
        initialFocus,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: DrawerOwnerState = { width, modal };
    const labels = { ...defaultLabels, ...labelsProp };
    const { anchorRef, container } = useThemePortalContainer<HTMLSpanElement>();

    const backdropProps = resolveSlotProps<DrawerOwnerState, typeof BaseDialog.Backdrop, typeof BaseDialog.Backdrop>({
        ownProps: { className: styles.backdrop },
        slotProps: slotProps?.backdrop,
        ownerState,
    });
    const headerProps = resolveSlotProps<DrawerOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const titleProps = resolveSlotProps<DrawerOwnerState, typeof BaseDialog.Title, typeof BaseDialog.Title>({
        ownProps: { className: styles.title, children: title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const descriptionProps = resolveSlotProps<DrawerOwnerState, typeof BaseDialog.Description, typeof BaseDialog.Description>({
        ownProps: { className: styles.description, children: description },
        slotProps: slotProps?.description,
        ownerState,
    });
    const bodyProps = resolveSlotProps<DrawerOwnerState, "div", "div">({
        ownProps: { className: styles.body },
        slotProps: slotProps?.body,
        ownerState,
    });
    const footerProps = resolveSlotProps<DrawerOwnerState, "div", "div">({
        ownProps: { className: styles.footer },
        slotProps: slotProps?.footer,
        ownerState,
    });

    return (
        <>
            <span ref={anchorRef} hidden />
            <BaseDialog.Root
                open={open}
                onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
                modal={ownerState.modal}
                disablePointerDismissal={!ownerState.modal}
            >
                <BaseDialog.Portal container={container}>
                    {ownerState.modal && <BaseDialog.Backdrop {...backdropProps} />}
                    <BaseDialog.Popup
                        {...restProps}
                        ref={ref}
                        initialFocus={initialFocus}
                        data-width={ownerState.width}
                        data-modal={ownerState.modal ? "" : undefined}
                        className={clsx(styles.root, className)}
                    >
                        <div {...headerProps}>
                            <BaseDialog.Title {...titleProps} />
                            {description != null && <BaseDialog.Description {...descriptionProps} />}
                        </div>
                        <div {...bodyProps}>{children}</div>
                        {footer != null && <div {...footerProps}>{footer}</div>}
                        <BaseDialog.Close
                            render={
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    size="small"
                                    {...slotProps?.closeButton}
                                    aria-label={labels.close}
                                    className={clsx(styles.closeButton, slotProps?.closeButton?.className)}
                                >
                                    <Icon name="close" />
                                </IconButton>
                            }
                        />
                    </BaseDialog.Popup>
                </BaseDialog.Portal>
            </BaseDialog.Root>
        </>
    );
});
