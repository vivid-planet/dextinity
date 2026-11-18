import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./EmptyState.module.scss";

type EmptyStateTitleElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type EmptyStateOwnerState = Record<string, never>;

export interface EmptyStateSlots {
    /**
     * Element for the `title` slot: a heading of the level that fits the page's outline.
     *
     * @defaultValue `h3`
     */
    title?: EmptyStateTitleElement;
}

export interface EmptyStateSlotProps {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<EmptyStateOwnerState, "span">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<EmptyStateOwnerState, "h3">;
    /** Props for the `description` slot. */
    description?: SlotPropsValue<EmptyStateOwnerState, "p">;
    /** Props for the `actions` slot. */
    actions?: SlotPropsValue<EmptyStateOwnerState, "div">;
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "title"> {
    /** What is going on, e.g. "No results for “Marketing Lead”". */
    title: string;
    /** Why, and what people can do about it. */
    description?: string;
    /** An icon above the title, e.g. `<Icon name="search" />`. */
    icon?: ReactNode;
    /** The way forward, usually one `Button`, e.g. "Reset filters". */
    actions?: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: EmptyStateSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: EmptyStateSlotProps;
}

/**
 * Says what is going on where content would be, and offers a way forward: no results, nothing created yet, or no access.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
    { title, description, icon, actions, className, slots, slotProps, ...restProps },
    ref,
) {
    const ownerState: EmptyStateOwnerState = {};
    const TitleSlot = slots?.title ?? "h3";

    const iconProps = resolveSlotProps<EmptyStateOwnerState, "span", "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const titleProps = resolveSlotProps<EmptyStateOwnerState, "h3", "h3">({
        ownProps: { className: styles.title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const descriptionProps = resolveSlotProps<EmptyStateOwnerState, "p", "p">({
        ownProps: { className: styles.description },
        slotProps: slotProps?.description,
        ownerState,
    });
    const actionsProps = resolveSlotProps<EmptyStateOwnerState, "div", "div">({
        ownProps: { className: styles.actions },
        slotProps: slotProps?.actions,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} className={clsx(styles.root, className)}>
            {icon != null && <span {...iconProps}>{icon}</span>}
            <TitleSlot {...titleProps}>{title}</TitleSlot>
            {description != null && <p {...descriptionProps}>{description}</p>}
            {actions != null && <div {...actionsProps}>{actions}</div>}
        </div>
    );
});
