import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./Card.module.scss";

type CardTitleElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CardOwnerState = Record<string, never>;

export interface CardSlots {
    /**
     * Element for the `title` slot: a heading of the level that fits the page's outline.
     *
     * @defaultValue `h2`
     */
    title?: CardTitleElement;
}

export interface CardSlotProps {
    /** Props for the `header` slot. */
    header?: SlotPropsValue<CardOwnerState, "header">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<CardOwnerState, "h2">;
    /** Props for the `meta` slot. */
    meta?: SlotPropsValue<CardOwnerState, "span">;
    /** Props for the `actions` slot. */
    actions?: SlotPropsValue<CardOwnerState, "div">;
    /** Props for the `body` slot. */
    body?: SlotPropsValue<CardOwnerState, "div">;
}

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "title"> {
    /** The heading of the card, which also names it for assistive technology. */
    title: string;
    /** An addition after the title, e.g. the number of entries: "12 pages". */
    meta?: ReactNode;
    /**
     * The actions at the end of the header, in this order: a filter such as the period, the card's own action, then a menu with
     * the remaining actions, e.g. an outlined `IconButton` with three dots. A link to the full view can take the place of the
     * menu.
     */
    actions?: ReactNode;
    /** The content, e.g. rows that bring their own padding. */
    children?: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: CardSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CardSlotProps;
}

/**
 * A card on an overview: a header with the title and the card's actions, set apart from the content by a line, then a short
 * excerpt of the content.
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
    { title, children, meta, actions, className, slots, slotProps, ...restProps },
    ref,
) {
    const ownerState: CardOwnerState = {};
    const titleId = useId();
    const TitleSlot = slots?.title ?? "h2";

    const headerProps = resolveSlotProps<CardOwnerState, "header", "header">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const titleProps = resolveSlotProps<CardOwnerState, "h2", "h2">({
        ownProps: { id: titleId, className: styles.title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const metaProps = resolveSlotProps<CardOwnerState, "span", "span">({
        ownProps: { className: styles.meta },
        slotProps: slotProps?.meta,
        ownerState,
    });
    const actionsProps = resolveSlotProps<CardOwnerState, "div", "div">({
        ownProps: { className: styles.actions },
        slotProps: slotProps?.actions,
        ownerState,
    });
    const bodyProps = resolveSlotProps<CardOwnerState, "div", "div">({
        ownProps: { className: styles.body },
        slotProps: slotProps?.body,
        ownerState,
    });

    return (
        <section aria-labelledby={titleProps.id} {...restProps} ref={ref} className={clsx(styles.root, className)}>
            <header {...headerProps}>
                <TitleSlot {...titleProps}>{title}</TitleSlot>
                {meta != null && <span {...metaProps}>{meta}</span>}
                {actions != null && <div {...actionsProps}>{actions}</div>}
            </header>
            <div {...bodyProps}>{children}</div>
        </section>
    );
});
