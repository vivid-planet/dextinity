import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./Panel.module.scss";

type PanelVariant = "glass" | "solid";
type PanelPadding = "default" | "none";
type PanelTitleElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type PanelOwnerState = {
    variant: PanelVariant;
    padding: PanelPadding;
};

export interface PanelSlots {
    /**
     * Element for the `title` slot: a heading of the level that fits the page's outline.
     *
     * @defaultValue `h2`
     */
    title?: PanelTitleElement;
}

export interface PanelSlotProps {
    /** Props for the `header` slot, the row with the heading and the actions. */
    header?: SlotPropsValue<PanelOwnerState, "div">;
    /** Props for the `heading` slot, which holds the title and the description. */
    heading?: SlotPropsValue<PanelOwnerState, "div">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<PanelOwnerState, "h2">;
    /** Props for the `description` slot. */
    description?: SlotPropsValue<PanelOwnerState, "div">;
    /** Props for the `actions` slot. */
    actions?: SlotPropsValue<PanelOwnerState, "div">;
    /** Props for the `body` slot. */
    body?: SlotPropsValue<PanelOwnerState, "div">;
}

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "title"> {
    /** The content. */
    children: ReactNode;
    /** The heading of the panel, which also names it for assistive technology. */
    title?: ReactNode;
    /** A line under the title. */
    description?: ReactNode;
    /** Actions at the end of the header, e.g. a text `Link` or an `IconButton`. */
    actions?: ReactNode;
    /**
     * `glass` over the light field, `solid` over media and wherever the background is busy. In high contrast, both are solid.
     *
     * @defaultValue `"glass"`
     */
    variant?: PanelVariant;
    /**
     * `none` lets tables and lists reach the edges of the panel.
     *
     * @defaultValue `"default"`
     */
    padding?: PanelPadding;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: PanelSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: PanelSlotProps;
}

/**
 * A surface that groups the content of one task. Panels sit side by side or stacked, never inside each other.
 */
export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel(
    { children, title, description, actions, variant = "glass", padding = "default", className, slots, slotProps, ...restProps },
    ref,
) {
    const ownerState: PanelOwnerState = { variant, padding };
    const titleId = useId();
    const TitleSlot = slots?.title ?? "h2";
    const hasHeader = title != null || description != null || actions != null;

    const headerProps = resolveSlotProps<PanelOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const headingProps = resolveSlotProps<PanelOwnerState, "div", "div">({
        ownProps: { className: styles.heading },
        slotProps: slotProps?.heading,
        ownerState,
    });
    const titleProps = resolveSlotProps<PanelOwnerState, "h2", "h2">({
        ownProps: { id: titleId, className: styles.title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const descriptionProps = resolveSlotProps<PanelOwnerState, "div", "div">({
        ownProps: { className: styles.description },
        slotProps: slotProps?.description,
        ownerState,
    });
    const actionsProps = resolveSlotProps<PanelOwnerState, "div", "div">({
        ownProps: { className: styles.actions },
        slotProps: slotProps?.actions,
        ownerState,
    });
    const bodyProps = resolveSlotProps<PanelOwnerState, "div", "div">({
        ownProps: { className: styles.body },
        slotProps: slotProps?.body,
        ownerState,
    });

    return (
        <section
            aria-labelledby={title != null ? titleProps.id : undefined}
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-padding={ownerState.padding}
            className={clsx(styles.root, className)}
        >
            {hasHeader && (
                <div {...headerProps}>
                    {(title != null || description != null) && (
                        <div {...headingProps}>
                            {title != null && <TitleSlot {...titleProps}>{title}</TitleSlot>}
                            {description != null && <div {...descriptionProps}>{description}</div>}
                        </div>
                    )}
                    {actions != null && <div {...actionsProps}>{actions}</div>}
                </div>
            )}
            <div {...bodyProps}>{children}</div>
        </section>
    );
});
