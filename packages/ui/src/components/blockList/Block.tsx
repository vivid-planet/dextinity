import { Collapsible } from "@base-ui/react/collapsible";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useId, useRef } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./Block.module.scss";
import { useBlockListItem } from "./blockListContext";

export interface BlockLabels {
    /** The accessible name of the grip, which moves the block. */
    move: string;
    /** The accessible name of the visibility toggle, pressed while the block is hidden. */
    hide: string;
    /** The tag on hidden blocks. */
    hidden: string;
    /** The accessible name of the button that shows or hides the block's fields. */
    toggleFields: string;
}

const defaultLabels: BlockLabels = {
    move: "Move",
    hide: "Hide",
    hidden: "Hidden",
    toggleFields: "Fields",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BlockOwnerState = {
    visible: boolean;
    selected: boolean;
    expanded: boolean;
    expandable: boolean;
};

export interface BlockSlotProps {
    /** Props for the `header` slot, the row with grip, icon, title, and actions. */
    header?: SlotPropsValue<BlockOwnerState, "div">;
    /** Props for the `main` slot, the button holding the icon, title, and summary. */
    main?: SlotPropsValue<BlockOwnerState, "button">;
    /** Props for the `icon` slot, the tile around the block type's icon. */
    icon?: SlotPropsValue<BlockOwnerState, "span">;
    /** Props for the `body` slot, which holds the fields. */
    body?: SlotPropsValue<BlockOwnerState, typeof Collapsible.Panel>;
}

export interface BlockProps extends Omit<HTMLAttributes<HTMLLIElement>, "className" | "title" | "onSelect"> {
    /** The block's title, taken from its content (e.g. the first heading), not its type. */
    title: ReactNode;
    /** A short summary below the title, e.g. the block type or "3 teasers". */
    summary?: ReactNode;
    /** The block type's icon, e.g. `<Icon name="image" />`. */
    icon?: ReactNode;
    /**
     * Whether the block is live once the page is published. A hidden block stays saved but is never live, independent of the page's
     * status.
     */
    visible: boolean;
    /** Called with the new visibility from the eye toggle. Without it, there is no toggle. */
    onVisibleChange?: (visible: boolean) => void;
    /** Whether the block's fields are shown. Leave it out for blocks that open elsewhere, e.g. nested blocks in a panel. */
    expanded?: boolean;
    /** Called with the new state from the toggle, or from the header when there is no `onSelect`. */
    onExpandedChange?: (expanded: boolean) => void;
    /**
     * Marks the block as selected, in sync with the preview.
     *
     * @defaultValue `false`
     */
    selected?: boolean;
    /** Called when the header is clicked, e.g. to select the block in the preview or open its fields in a panel. */
    onSelect?: () => void;
    /** Further actions in the header, e.g. a menu button. */
    actions?: ReactNode;
    /** The block's fields, shown while `expanded`. */
    children?: ReactNode;
    /** The built-in texts. */
    labels?: Partial<BlockLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: BlockSlotProps;
}

/**
 * A block in the page editor: grip, type icon, title, summary, visibility, and actions, with its fields below when expanded. Use it
 * inside a `BlockList`.
 */
export const Block = forwardRef<HTMLLIElement, BlockProps>(function Block(
    {
        title,
        summary,
        icon,
        visible,
        onVisibleChange,
        expanded,
        onExpandedChange,
        selected = false,
        onSelect,
        actions,
        children,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const listItem = useBlockListItem();
    const gripRef = useRef<HTMLButtonElement>(null);
    const titleId = useId();
    const ownerState: BlockOwnerState = {
        visible,
        selected,
        expanded: expanded ?? false,
        expandable: expanded != null,
    };

    const focusGrip = listItem?.focusGrip ?? false;
    const onGripFocused = listItem?.onGripFocused;
    useEffect(() => {
        if (focusGrip) {
            gripRef.current?.focus();
            onGripFocused?.();
        }
    }, [focusGrip, onGripFocused]);

    const toggleExpanded = () => onExpandedChange?.(!ownerState.expanded);

    const headerProps = resolveSlotProps<BlockOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const mainProps = resolveSlotProps<BlockOwnerState, "button", "button">({
        ownProps: {
            className: styles.main,
            type: "button",
            onClick: onSelect ?? (ownerState.expandable ? toggleExpanded : undefined),
            "aria-pressed": onSelect != null ? ownerState.selected : undefined,
            "aria-expanded": onSelect == null && ownerState.expandable ? ownerState.expanded : undefined,
        },
        slotProps: slotProps?.main,
        ownerState,
    });
    const iconProps = resolveSlotProps<BlockOwnerState, "span", "span">({
        ownProps: { className: styles.icon },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const bodyProps = resolveSlotProps<BlockOwnerState, typeof Collapsible.Panel, typeof Collapsible.Panel>({
        ownProps: { className: styles.body },
        slotProps: slotProps?.body,
        ownerState,
    });

    return (
        <Collapsible.Root
            open={ownerState.expanded}
            onOpenChange={(open) => onExpandedChange?.(open)}
            render={
                <li
                    {...restProps}
                    ref={ref}
                    data-visible={ownerState.visible ? "" : undefined}
                    data-selected={ownerState.selected ? "" : undefined}
                    data-expanded={ownerState.expanded ? "" : undefined}
                    data-expandable={ownerState.expandable ? "" : undefined}
                    data-drop={listItem?.dropPosition}
                    data-dragging={listItem?.dragging ? "" : undefined}
                    className={clsx(styles.root, className)}
                    onDragOver={listItem?.onDragOver}
                    onDrop={listItem?.onDrop}
                />
            }
        >
            <div {...headerProps}>
                {listItem?.reorderable && (
                    <Tooltip content={labels.move}>
                        <button
                            ref={gripRef}
                            type="button"
                            className={styles.grip}
                            aria-label={labels.move}
                            aria-describedby={titleId}
                            aria-keyshortcuts="ArrowUp ArrowDown Home End"
                            draggable
                            onKeyDown={listItem.onGripKeyDown}
                            onDragStart={listItem.onDragStart}
                            onDragEnd={listItem.onDragEnd}
                        >
                            <Icon name="grip" />
                        </button>
                    </Tooltip>
                )}
                <button {...mainProps}>
                    {icon != null && <span {...iconProps}>{icon}</span>}
                    <span className={styles.text}>
                        <span id={titleId} className={styles.title}>
                            {title}
                        </span>
                        {summary != null && <span className={styles.summary}>{summary}</span>}
                    </span>
                </button>
                {!ownerState.visible && <span className={styles.hiddenTag}>{labels.hidden}</span>}
                {onVisibleChange != null && (
                    <IconButton
                        size="small"
                        className={styles.visibility}
                        aria-label={labels.hide}
                        aria-pressed={!ownerState.visible}
                        onClick={() => onVisibleChange(!ownerState.visible)}
                    >
                        <Icon name={ownerState.visible ? "eye" : "eye-off"} />
                    </IconButton>
                )}
                {actions != null && <span className={styles.actions}>{actions}</span>}
                {!ownerState.expandable && onSelect != null && <Icon name="chevron-right" className={styles.chevron} />}
                {ownerState.expandable && (
                    <Collapsible.Trigger
                        render={
                            <IconButton size="small" className={styles.toggle} aria-label={labels.toggleFields}>
                                <Icon name="chevron-down" className={styles.toggleIcon} />
                            </IconButton>
                        }
                    />
                )}
            </div>
            {ownerState.expandable && (
                <Collapsible.Panel {...bodyProps}>
                    <div className={styles.fields}>{children}</div>
                </Collapsible.Panel>
            )}
        </Collapsible.Root>
    );
});
