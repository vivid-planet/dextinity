import { Toolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { forwardRef, Fragment, type HTMLAttributes, type KeyboardEvent, type ReactNode, useCallback, useEffect, useId, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { Menu } from "../menu/Menu";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./BulkActionBar.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BulkActionBarOwnerState = {
    open: boolean;
    /** Every one of `total` items is selected, not only the ones in `count`. */
    allSelected: boolean;
};

interface BulkActionBarActionBase {
    /** The visible name of the action. */
    label: string;
    /** An icon before the label, e.g. `<Icon name="archive" />`. */
    icon?: ReactNode;
    /**
     * `error` for destructive actions such as "Delete".
     *
     * @defaultValue `"default"`
     */
    color?: "default" | "error";
    /** Prevents running the action, e.g. when it doesn't apply to every selected item. */
    disabled?: boolean;
    /**
     * Why the action is disabled, e.g. "Select the subpages too to delete a page". Shown in a tooltip and read with the button, so
     * people know what to change instead of guessing.
     */
    disabledReason?: string;
}

/**
 * An action of a `BulkActionBar` that runs on click.
 */
export interface BulkActionBarButtonAction extends BulkActionBarActionBase {
    /** Runs the action on the selected items. */
    onClick: () => void;
    menu?: never;
}

/**
 * An action of a `BulkActionBar` that opens a menu, e.g. "Move to" with the folders to choose from.
 */
export interface BulkActionBarMenuAction extends BulkActionBarActionBase {
    /** The menu's content, e.g. `MenuItem`s, `MenuSeparator`s, and `MenuSubmenu`s. */
    menu: ReactNode;
    /** Whether the menu is open. */
    open: boolean;
    /** Called with the new open state, e.g. when the button is clicked or an item is chosen. */
    onOpenChange: (open: boolean) => void;
    onClick?: never;
}

/**
 * An action of a `BulkActionBar`: a button, or a button that opens a menu.
 */
export type BulkActionBarAction = BulkActionBarButtonAction | BulkActionBarMenuAction;

export interface BulkActionBarLabels {
    /** The number of selected items, e.g. "3 selected". */
    count: (count: number) => string;
    /** The accessible name and tooltip of the button that clears the selection. */
    clear: string;
    /** The accessible name of the bar. */
    toolbar: string;
    /** The button that selects all items, e.g. "Select all 78". */
    selectAll: (total: number) => string;
    /** The count while all items are selected, e.g. "All 78 selected", or "All selected" without `total`. */
    allSelected: (total?: number) => string;
}

export const defaultBulkActionBarLabels: BulkActionBarLabels = {
    count: (count) => `${count} selected`,
    clear: "Clear selection",
    toolbar: "Bulk actions",
    selectAll: (total) => `Select all ${total}`,
    allSelected: (total) => (total != null ? `All ${total} selected` : "All selected"),
};

export interface BulkActionBarSlotProps {
    /** Props for the `count` slot, the number of selected items. */
    count?: SlotPropsValue<BulkActionBarOwnerState, "span">;
    /** Props for each `action` slot, the buttons of the actions, including the ones that open a menu. */
    action?: SlotPropsValue<BulkActionBarOwnerState, typeof Toolbar.Button>;
    /** Props for the `clear` slot, the button that clears the selection. */
    clear?: SlotPropsValue<BulkActionBarOwnerState, typeof Toolbar.Button>;
    /** Props for the `separator` slot, the dot between the count and the button that selects all items. */
    separator?: SlotPropsValue<BulkActionBarOwnerState, "span">;
    /** Props for the `selectAll` slot, the button that selects all items, or clears the selection while all are selected. */
    selectAll?: SlotPropsValue<BulkActionBarOwnerState, typeof Toolbar.Button>;
}

export interface BulkActionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The number of selected items. The bar shows while it is greater than 0, or while `allSelected`. */
    count: number;
    /**
     * The number of all items the selection could cover, e.g. all matches of the filters on every page. With `onSelectAll`, the
     * bar offers to select them.
     */
    total?: number;
    /**
     * Every one of `total` items is selected, not only the ones in `count`, e.g. also those on other pages. The bar shows "All 78
     * selected", and with `onSelectAll`, a "Clear selection" button in place of ✕.
     */
    allSelected?: boolean;
    /**
     * Selects all `total` items, offered as "Select all 78" while fewer are selected. Set `allSelected` in response; the button then
     * clears the selection and keeps its focus.
     */
    onSelectAll?: () => void;
    /** The actions that apply to all selected items. */
    actions: BulkActionBarAction[];
    /** Clears the selection; also called on Escape. */
    onClear: () => void;
    /** Texts for translation; missing keys fall back to `defaultBulkActionBarLabels`. */
    labels?: Partial<BulkActionBarLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: BulkActionBarSlotProps;
}

/**
 * Appears while items are selected, with their number and the actions that apply to all of them. It floats centered at the bottom of
 * the window, above the page, so it stays in reach however far the list scrolls; render it anywhere in the page.
 */
export const BulkActionBar = forwardRef<HTMLDivElement, BulkActionBarProps>(function BulkActionBar(
    { count, total, allSelected = false, onSelectAll, actions, onClear, labels: labelsProp, className, slotProps, onKeyDown, ...restProps },
    ref,
) {
    const labels = { ...defaultBulkActionBarLabels, ...labelsProp };
    const reasonIdPrefix = useId();
    const ownerState: BulkActionBarOwnerState = { open: count > 0 || allSelected, allSelected };
    // Keeps showing the last selection while the bar fades out after the selection was cleared
    const [shown, setShown] = useState({ count, allSelected });
    if (ownerState.open && (count !== shown.count || allSelected !== shown.allSelected)) {
        setShown({ count, allSelected });
    }
    const offersSelectAll = onSelectAll != null && total != null && (shown.allSelected || shown.count < total);

    const [element, setElement] = useState<HTMLDivElement | null>(null);
    const setRefs = useCallback(
        (node: HTMLDivElement | null) => {
            setElement(node);
            if (typeof ref === "function") {
                // React 19 callback refs may return a cleanup, which `ForwardedRef` doesn't type
                const refCleanup: unknown = ref(node);
                // React 19 runs this cleanup instead of calling the ref with `null`, so a ref without its own cleanup gets the `null` here;
                // React 18 ignores it and calls the ref with `null` itself
                return () => {
                    setElement(null);
                    if (typeof refCleanup === "function") {
                        refCleanup();
                    } else {
                        ref(null);
                    }
                };
            }
            if (ref) {
                ref.current = node;
            }
        },
        [ref],
    );
    // The toasts move up by the bar's height, which grows when its actions wrap on a narrow window
    useEffect(() => {
        if (element == null || !ownerState.open || typeof ResizeObserver === "undefined") {
            return;
        }
        const rootStyle = element.ownerDocument.documentElement.style;
        const observer = new ResizeObserver(() => rootStyle.setProperty("--dextinity-bulk-action-bar-height", `${element.offsetHeight}px`));
        observer.observe(element);
        return () => {
            observer.disconnect();
            rootStyle.removeProperty("--dextinity-bulk-action-bar-height");
        };
    }, [element, ownerState.open]);

    const countProps = resolveSlotProps<BulkActionBarOwnerState, "span", "span">({
        ownProps: { className: styles.count, role: "status" },
        slotProps: slotProps?.count,
        ownerState,
    });
    const clearProps = resolveSlotProps<BulkActionBarOwnerState, typeof Toolbar.Button, typeof Toolbar.Button>({
        ownProps: { className: styles.clear, "aria-label": labels.clear, onClick: onClear },
        slotProps: slotProps?.clear,
        ownerState,
    });
    const separatorProps = resolveSlotProps<BulkActionBarOwnerState, "span", "span">({
        ownProps: { className: styles.separator, "aria-hidden": true },
        slotProps: slotProps?.separator,
        ownerState,
    });
    // One button for both states, so it keeps the focus when it switches from selecting all to clearing
    const selectAllProps = resolveSlotProps<BulkActionBarOwnerState, typeof Toolbar.Button, typeof Toolbar.Button>({
        ownProps: { className: styles.selectAll, onClick: shown.allSelected ? onClear : onSelectAll },
        slotProps: slotProps?.selectAll,
        ownerState,
    });

    return (
        <Toolbar.Root
            {...restProps}
            ref={setRefs}
            aria-label={restProps["aria-label"] ?? labels.toolbar}
            data-open={ownerState.open ? "" : undefined}
            data-allselected={ownerState.allSelected ? "" : undefined}
            inert={!ownerState.open}
            className={clsx(styles.root, className)}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                onKeyDown?.(event);
                // An action's menu is portaled elsewhere in the document; Escape there only closes the menu
                const isInBar = event.target instanceof Node && event.currentTarget.contains(event.target);
                if (event.key === "Escape" && !event.defaultPrevented && isInBar) {
                    event.preventDefault();
                    onClear();
                }
            }}
        >
            <span {...countProps}>{shown.allSelected ? labels.allSelected(total) : labels.count(shown.count)}</span>
            {offersSelectAll && (
                <>
                    <span {...separatorProps} />
                    <Toolbar.Button {...selectAllProps}>{shown.allSelected ? labels.clear : labels.selectAll(total)}</Toolbar.Button>
                </>
            )}
            {actions.map((action, index) => {
                const actionProps = resolveSlotProps<BulkActionBarOwnerState, typeof Toolbar.Button, typeof Toolbar.Button>({
                    ownProps: {
                        className: styles.action,
                        disabled: action.disabled,
                        onClick: action.onClick,
                        "aria-haspopup": action.menu != null ? "menu" : undefined,
                    },
                    slotProps: slotProps?.action,
                    ownerState,
                });
                const disabledReason = action.disabled === true ? action.disabledReason : undefined;
                const reasonId = `${reasonIdPrefix}-${index}`;
                const button = (
                    <Toolbar.Button
                        key={action.label}
                        data-color={action.color ?? "default"}
                        aria-describedby={disabledReason != null ? reasonId : undefined}
                        {...actionProps}
                    >
                        {action.icon != null && (
                            <span className={styles.actionIcon} aria-hidden>
                                {action.icon}
                            </span>
                        )}
                        {action.label}
                        {action.menu != null && (
                            <span className={styles.actionIcon} data-menu-indicator="" aria-hidden>
                                <Icon name="chevron-up" />
                            </span>
                        )}
                    </Toolbar.Button>
                );
                if (action.menu != null && action.disabled !== true) {
                    return (
                        <Menu key={action.label} open={action.open} onOpenChange={action.onOpenChange} placement="top-start" trigger={button}>
                            {action.menu}
                        </Menu>
                    );
                }
                return disabledReason != null ? (
                    <Fragment key={action.label}>
                        <Tooltip content={disabledReason}>{button}</Tooltip>
                        <span id={reasonId} hidden>
                            {disabledReason}
                        </span>
                    </Fragment>
                ) : (
                    button
                );
            })}
            {/* While all are selected, the select-all button clears the selection under the same name */}
            {!(offersSelectAll && shown.allSelected) && (
                <Tooltip content={labels.clear}>
                    <Toolbar.Button {...clearProps}>
                        <Icon name="close" />
                    </Toolbar.Button>
                </Tooltip>
            )}
        </Toolbar.Root>
    );
});
