import { Toolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./BulkActionBar.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BulkActionBarOwnerState = {
    open: boolean;
};

export interface BulkActionBarAction {
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
    /** Runs the action on the selected items. */
    onClick: () => void;
}

export interface BulkActionBarLabels {
    /** The number of selected items, e.g. "3 selected". */
    count: (count: number) => string;
    /** The accessible name and tooltip of the button that clears the selection. */
    clear: string;
    /** The accessible name of the bar. */
    toolbar: string;
}

export const defaultBulkActionBarLabels: BulkActionBarLabels = {
    count: (count) => `${count} selected`,
    clear: "Clear selection",
    toolbar: "Bulk actions",
};

export interface BulkActionBarSlotProps {
    /** Props for the `count` slot, the number of selected items. */
    count?: SlotPropsValue<BulkActionBarOwnerState, "span">;
    /** Props for each `action` slot, the buttons of the actions. */
    action?: SlotPropsValue<BulkActionBarOwnerState, typeof Toolbar.Button>;
    /** Props for the `clear` slot, the button that clears the selection. */
    clear?: SlotPropsValue<BulkActionBarOwnerState, typeof Toolbar.Button>;
}

export interface BulkActionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The number of selected items. The bar shows while it is greater than 0. */
    count: number;
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
 * Appears while items are selected, with their number and the actions that apply to all of them.
 */
export const BulkActionBar = forwardRef<HTMLDivElement, BulkActionBarProps>(function BulkActionBar(
    { count, actions, onClear, labels: labelsProp, className, slotProps, onKeyDown, ...restProps },
    ref,
) {
    const labels = { ...defaultBulkActionBarLabels, ...labelsProp };
    const ownerState: BulkActionBarOwnerState = { open: count > 0 };
    // Keeps showing the last count while the bar fades out after the selection was cleared
    const [shownCount, setShownCount] = useState(count);
    if (count > 0 && count !== shownCount) {
        setShownCount(count);
    }

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

    return (
        <Toolbar.Root
            {...restProps}
            ref={ref}
            aria-label={restProps["aria-label"] ?? labels.toolbar}
            data-open={ownerState.open ? "" : undefined}
            inert={!ownerState.open}
            className={clsx(styles.root, className)}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                onKeyDown?.(event);
                if (event.key === "Escape" && !event.defaultPrevented) {
                    event.preventDefault();
                    onClear();
                }
            }}
        >
            <span {...countProps}>{labels.count(shownCount)}</span>
            {actions.map((action) => {
                const actionProps = resolveSlotProps<BulkActionBarOwnerState, typeof Toolbar.Button, typeof Toolbar.Button>({
                    ownProps: {
                        className: styles.action,
                        disabled: action.disabled,
                        onClick: action.onClick,
                    },
                    slotProps: slotProps?.action,
                    ownerState,
                });
                return (
                    <Toolbar.Button key={action.label} data-color={action.color ?? "default"} {...actionProps}>
                        {action.icon != null && (
                            <span className={styles.actionIcon} aria-hidden>
                                {action.icon}
                            </span>
                        )}
                        {action.label}
                    </Toolbar.Button>
                );
            })}
            <Tooltip content={labels.clear}>
                <Toolbar.Button {...clearProps}>
                    <Icon name="close" />
                </Toolbar.Button>
            </Tooltip>
        </Toolbar.Root>
    );
});
