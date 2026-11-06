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
    /** Props for the `orb` slot, the round surface behind the icon. */
    orb?: SlotPropsValue<CardOwnerState, "span">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<CardOwnerState, "h2">;
    /** Props for the `meta` slot. */
    meta?: SlotPropsValue<CardOwnerState, "span">;
    /** Props for the `link` slot. */
    link?: SlotPropsValue<CardOwnerState, "div">;
    /** Props for the `body` slot. */
    body?: SlotPropsValue<CardOwnerState, "div">;
}

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "title"> {
    /** The heading of the card, which also names it for assistive technology. */
    title: string;
    /** The content, e.g. rows that bring their own padding. */
    children: ReactNode;
    /** An icon in the orb before the title, e.g. `<Icon name="time" duotone />`. */
    icon?: ReactNode;
    /** An addition after the title, e.g. "30 days". */
    meta?: ReactNode;
    /** A link to the full view at the end of the header, e.g. a `Link` with an arrow. */
    link?: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: CardSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CardSlotProps;
}

/**
 * A card on an overview: an icon in an orb, a title, a link to the full view, and a short excerpt of the content.
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
    { title, children, icon, meta, link, className, slots, slotProps, ...restProps },
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
    const orbProps = resolveSlotProps<CardOwnerState, "span", "span">({
        ownProps: { className: styles.orb, "aria-hidden": true },
        slotProps: slotProps?.orb,
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
    const linkProps = resolveSlotProps<CardOwnerState, "div", "div">({
        ownProps: { className: styles.link },
        slotProps: slotProps?.link,
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
                {icon != null && <span {...orbProps}>{icon}</span>}
                <TitleSlot {...titleProps}>{title}</TitleSlot>
                {meta != null && <span {...metaProps}>{meta}</span>}
                {link != null && <div {...linkProps}>{link}</div>}
            </header>
            <div {...bodyProps}>{children}</div>
        </section>
    );
});
