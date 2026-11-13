import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { Link, type LinkProps } from "../link/Link";
import styles from "./OverviewLayout.module.scss";

export interface OverviewLayoutBack {
    /** The visible link text, naming where the link leads, e.g. "All sites". */
    label: string;
    /** The destination. */
    href: string;
    /** Called when the link is chosen, e.g. to navigate with the router. */
    onClick?: () => void;
    /** Render the link as a custom element, e.g. the router's link component. */
    render?: LinkProps["render"];
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type OverviewLayoutOwnerState = {
    /** Whether the greeting has content on its end side, e.g. a clock. */
    aside: boolean;
};

export interface OverviewLayoutSlotProps {
    /** Props for the `hero` slot, the row with the greeting and the aside. */
    hero?: SlotPropsValue<OverviewLayoutOwnerState, "header">;
    /** Props for the `heading` slot, which holds the label, the title, and the summary. */
    heading?: SlotPropsValue<OverviewLayoutOwnerState, "div">;
    /** Props for the `label` slot, the mono line above the greeting with the back link and the eyebrow. */
    label?: SlotPropsValue<OverviewLayoutOwnerState, "div">;
    /** Props for the back link, e.g. a different `startIcon`. */
    back?: Partial<Omit<LinkProps, "children" | "href" | "render">>;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<OverviewLayoutOwnerState, "h1">;
    /** Props for the `summary` slot. */
    summary?: SlotPropsValue<OverviewLayoutOwnerState, "p">;
    /** Props for the `aside` slot. */
    aside?: SlotPropsValue<OverviewLayoutOwnerState, "div">;
    /** Props for the `cards` slot, the grid of cards. */
    cards?: SlotPropsValue<OverviewLayoutOwnerState, "div">;
}

export interface OverviewLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "title"> {
    /** The greeting, e.g. "Good morning, Max". */
    title: ReactNode;
    /** A mono label above the greeting, e.g. the app name. */
    eyebrow?: ReactNode;
    /** A back link before the eyebrow, for an overview below another page, e.g. the overview of one site among several. */
    back?: OverviewLayoutBack;
    /** One sentence on what happened since the last visit, with links to it. Warnings belong in their own card, not here. */
    summary?: ReactNode;
    /** Shown at the end of the greeting, e.g. a clock with the date; hidden in narrow layouts. */
    aside?: ReactNode;
    /** The cards, at most six; each leads on to its full view. Two columns, one in narrow layouts. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: OverviewLayoutSlotProps;
}

const labelSeparator = "·";

/**
 * The layout of an overview page, the entry point of an app: a greeting with a summary of what happened, then cards that lead on.
 */
export const OverviewLayout = forwardRef<HTMLDivElement, OverviewLayoutProps>(function OverviewLayout(
    { title, eyebrow, back, summary, aside, children, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: OverviewLayoutOwnerState = { aside: aside != null };

    const heroProps = resolveSlotProps<OverviewLayoutOwnerState, "header", "header">({
        ownProps: { className: styles.hero },
        slotProps: slotProps?.hero,
        ownerState,
    });
    const headingProps = resolveSlotProps<OverviewLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.heading },
        slotProps: slotProps?.heading,
        ownerState,
    });
    const labelProps = resolveSlotProps<OverviewLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const titleProps = resolveSlotProps<OverviewLayoutOwnerState, "h1", "h1">({
        ownProps: { className: styles.title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const summaryProps = resolveSlotProps<OverviewLayoutOwnerState, "p", "p">({
        ownProps: { className: styles.summary },
        slotProps: slotProps?.summary,
        ownerState,
    });
    const asideProps = resolveSlotProps<OverviewLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.aside },
        slotProps: slotProps?.aside,
        ownerState,
    });
    const cardsProps = resolveSlotProps<OverviewLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.cards },
        slotProps: slotProps?.cards,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} data-aside={ownerState.aside ? "" : undefined} className={clsx(styles.root, className)}>
            <header {...heroProps}>
                <div {...headingProps}>
                    {(back != null || eyebrow != null) && (
                        <div {...labelProps}>
                            {back != null && (
                                <Link
                                    startIcon={<Icon name="arrow-left" />}
                                    {...slotProps?.back}
                                    className={clsx(styles.back, slotProps?.back?.className)}
                                    href={back.href}
                                    render={back.render}
                                    onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                                        slotProps?.back?.onClick?.(event);
                                        if (back.onClick != null) {
                                            event.preventDefault();
                                            back.onClick();
                                        }
                                    }}
                                >
                                    {back.label}
                                </Link>
                            )}
                            {back != null && eyebrow != null && <span aria-hidden>{labelSeparator}</span>}
                            {eyebrow}
                        </div>
                    )}
                    <h1 {...titleProps}>{title}</h1>
                    {summary != null && <p {...summaryProps}>{summary}</p>}
                </div>
                {aside != null && <div {...asideProps}>{aside}</div>}
            </header>
            <div {...cardsProps}>{children}</div>
        </div>
    );
});
