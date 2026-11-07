import { clsx } from "clsx";
import { type FocusEvent, forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./ListDetailLayout.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ListDetailLayoutOwnerState = {
    /** Whether the side panel is open. */
    open: boolean;
    /** Whether the page has a toolbar above the list. */
    toolbar: boolean;
};

export interface ListDetailLayoutSlotProps {
    /** Props for the `header` slot. */
    header?: SlotPropsValue<ListDetailLayoutOwnerState, "div">;
    /** Props for the `body` slot, which holds the list column and the side panel. */
    body?: SlotPropsValue<ListDetailLayoutOwnerState, "div">;
    /** Props for the `main` slot, the column with the toolbar and the list. */
    main?: SlotPropsValue<ListDetailLayoutOwnerState, "div">;
    /** Props for the `toolbar` slot. */
    toolbar?: SlotPropsValue<ListDetailLayoutOwnerState, "div">;
    /** Props for the `content` slot, which holds the list. */
    content?: SlotPropsValue<ListDetailLayoutOwnerState, "div">;
    /** Props for the `sidePanel` slot. */
    sidePanel?: SlotPropsValue<ListDetailLayoutOwnerState, "aside">;
}

export interface ListDetailLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The page header with the scope, the count, and the primary action, e.g. a `PageHeader`. */
    header: ReactNode;
    /** Search and filters above the list, e.g. a `FilterBar`. */
    toolbar?: ReactNode;
    /** The list, e.g. a `DataGrid`. A click on a row opens the side panel; the list stays visible. */
    children: ReactNode;
    /** The side panel: a short form with save, e.g. for a redirect. Long forms belong on an edit page. */
    sidePanel: ReactNode;
    /** The accessible name of the side panel, e.g. "Edit redirect". */
    sidePanelLabel: string;
    /** Whether the side panel is shown next to the list. */
    open: boolean;
    /**
     * Called with `false` when Escape is pressed in the side panel. When the panel closes while it has focus, focus returns to the element
     * outside the panel that had it last, e.g. the row that opened it.
     */
    onOpenChange: (open: boolean) => void;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ListDetailLayoutSlotProps;
}

/**
 * The layout of a list whose short records are edited in a side panel next to it: the page header, a toolbar, the list, and the side
 * panel. In narrow layouts the side panel moves above the list.
 */
export const ListDetailLayout = forwardRef<HTMLDivElement, ListDetailLayoutProps>(function ListDetailLayout(
    { header, toolbar, children, sidePanel, sidePanelLabel, open, onOpenChange, className, slotProps, onFocusCapture, ...restProps },
    ref,
) {
    const ownerState: ListDetailLayoutOwnerState = { open, toolbar: toolbar != null };
    const sidePanelRef = useRef<HTMLElement>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const panelHadFocusRef = useRef(false);

    function rememberFocus(event: FocusEvent<HTMLDivElement>) {
        onFocusCapture?.(event);
        const inPanel = sidePanelRef.current?.contains(event.target) ?? false;
        panelHadFocusRef.current = inPanel;
        if (!inPanel && event.target instanceof HTMLElement) {
            returnFocusRef.current = event.target;
        }
    }

    useEffect(() => {
        if (open || !panelHadFocusRef.current) {
            return;
        }
        panelHadFocusRef.current = false;
        // The panel unmounted with the focus inside it, which dropped the focus to the body
        const returnTarget = returnFocusRef.current;
        if (returnTarget?.isConnected && (document.activeElement == null || document.activeElement === document.body)) {
            returnTarget.focus();
        }
    }, [open]);

    function closeOnEscape(event: KeyboardEvent<HTMLElement>) {
        // Escape in a popup portaled out of the panel, e.g. a select's list, closes only that popup
        if (event.key !== "Escape" || event.defaultPrevented || !event.currentTarget.contains(event.target as Node)) {
            return;
        }
        onOpenChange(false);
    }

    const headerProps = resolveSlotProps<ListDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const bodyProps = resolveSlotProps<ListDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.body },
        slotProps: slotProps?.body,
        ownerState,
    });
    const mainProps = resolveSlotProps<ListDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.main },
        slotProps: slotProps?.main,
        ownerState,
    });
    const toolbarProps = resolveSlotProps<ListDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.toolbar },
        slotProps: slotProps?.toolbar,
        ownerState,
    });
    const contentProps = resolveSlotProps<ListDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.content },
        slotProps: slotProps?.content,
        ownerState,
    });
    const sidePanelProps = resolveSlotProps<ListDetailLayoutOwnerState, "aside", "aside">({
        ownProps: { className: styles.sidePanel, "aria-label": sidePanelLabel, onKeyDown: closeOnEscape },
        slotProps: slotProps?.sidePanel,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            onFocusCapture={rememberFocus}
            data-open={ownerState.open ? "" : undefined}
            data-toolbar={ownerState.toolbar ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...headerProps}>{header}</div>
            <div {...bodyProps}>
                <div {...mainProps}>
                    {toolbar != null && <div {...toolbarProps}>{toolbar}</div>}
                    <div {...contentProps}>{children}</div>
                </div>
                {open && (
                    <aside {...sidePanelProps} ref={sidePanelRef}>
                        {sidePanel}
                    </aside>
                )}
            </div>
        </div>
    );
});
