import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { type AnchorHTMLAttributes, forwardRef, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./CardRow.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CardRowOwnerState = Record<string, never>;

export interface CardRowSlotProps {
    /** Props for the `text` slot, which holds the title and the subtitle. */
    text?: SlotPropsValue<CardRowOwnerState, "span">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<CardRowOwnerState, "span">;
    /** Props for the `subtitle` slot. */
    subtitle?: SlotPropsValue<CardRowOwnerState, "span">;
    /** Props for the `end` slot. */
    end?: SlotPropsValue<CardRowOwnerState, "span">;
    /** Props for the `arrow` slot. */
    arrow?: SlotPropsValue<CardRowOwnerState, "span">;
}

export interface CardRowProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "title" | "children"> {
    /** What the row leads to, e.g. the name of a page. */
    title: ReactNode;
    /** A line under the title, e.g. the path or the context of a warning. */
    subtitle?: ReactNode;
    /** Shown before the arrow, e.g. a status, an avatar, or a time. */
    end?: ReactNode;
    /** The destination. */
    href?: string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CardRowSlotProps;
    /**
     * Render a custom root element, e.g. the router's link component, instead of an anchor.
     *
     * @example
     * ```tsx
     * <CardRow title="Open positions" render={<RouterLink to="/pages/open-positions" />} />
     * ```
     */
    render?: useRender.RenderProp<CardRowOwnerState>;
}

/**
 * One entry in a card that leads to its full view, e.g. a recently edited page or a warning.
 */
export const CardRow = forwardRef<HTMLAnchorElement, CardRowProps>(function CardRow(
    { title, subtitle, end, className, slotProps, render, ...restProps },
    ref,
) {
    const ownerState: CardRowOwnerState = {};

    const textProps = resolveSlotProps<CardRowOwnerState, "span", "span">({
        ownProps: { className: styles.text },
        slotProps: slotProps?.text,
        ownerState,
    });
    const titleProps = resolveSlotProps<CardRowOwnerState, "span", "span">({
        ownProps: { className: styles.title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const subtitleProps = resolveSlotProps<CardRowOwnerState, "span", "span">({
        ownProps: { className: styles.subtitle },
        slotProps: slotProps?.subtitle,
        ownerState,
    });
    const endProps = resolveSlotProps<CardRowOwnerState, "span", "span">({
        ownProps: { className: styles.end },
        slotProps: slotProps?.end,
        ownerState,
    });
    const arrowProps = resolveSlotProps<CardRowOwnerState, "span", "span">({
        ownProps: { className: styles.arrow, "aria-hidden": true },
        slotProps: slotProps?.arrow,
        ownerState,
    });

    return useRender({
        ref,
        render,
        state: ownerState,
        defaultTagName: "a",
        props: {
            ...restProps,
            className: clsx(styles.root, className),
            children: (
                <>
                    <span {...textProps}>
                        <span {...titleProps}>{title}</span>
                        {subtitle != null && <span {...subtitleProps}>{subtitle}</span>}
                    </span>
                    {end != null && <span {...endProps}>{end}</span>}
                    <span {...arrowProps}>
                        <Icon name="arrow-right" size="small" />
                    </span>
                </>
            ),
        },
    });
});
