import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { Link, type LinkProps } from "../link/Link";
import styles from "./PageHeader.module.scss";

type PageHeaderVariant = "default" | "compact";

export interface PageHeaderBack {
    /** Where the link leads, e.g. "Page tree". Use the same destination as the breadcrumbs. */
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
export type PageHeaderOwnerState = {
    variant: PageHeaderVariant;
    hasBack: boolean;
    hasActions: boolean;
};

export interface PageHeaderSlotProps {
    /** Props for the `heading` slot, the column with the label line, title, and subtitle. */
    heading?: SlotPropsValue<PageHeaderOwnerState, "div">;
    /** Props for the `labelLine` slot, the mono line above the title with the back link, breadcrumbs, and eyebrow. */
    labelLine?: SlotPropsValue<PageHeaderOwnerState, "div">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<PageHeaderOwnerState, "h1">;
    /** Props for the `subtitle` slot. */
    subtitle?: SlotPropsValue<PageHeaderOwnerState, "div">;
    /** Props for the `actions` slot. */
    actions?: SlotPropsValue<PageHeaderOwnerState, "div">;
    /** Props for the back link, e.g. a different `startIcon`. */
    back?: Partial<Omit<LinkProps, "children" | "href" | "render">>;
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "title"> {
    /** The display title. Exactly one per page. */
    title: string;
    /**
     * `compact` for editors, where the content needs the room: a smaller title, a tighter label line, and the actions centered next to
     * the title.
     *
     * @defaultValue `"default"`
     */
    variant?: PageHeaderVariant;
    /** The label above the title, e.g. the scope or the area: "Austria · German · 23 pages". */
    eyebrow?: ReactNode;
    /** Numbers or status below the title, e.g. "3 unpublished · 1 archived". */
    subtitle?: ReactNode;
    /** Actions at the end, e.g. a `Button`. At most one primary action. */
    actions?: ReactNode;
    /** A back link at the start of the label line, for edit pages. */
    back?: PageHeaderBack;
    /** Breadcrumbs in the label line, e.g. `<Breadcrumbs variant="label" />`, after the back link and before the eyebrow. */
    breadcrumbs?: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: PageHeaderSlotProps;
}

const labelSeparator = "·";

/**
 * The head of every page: a mono label line for context, the display title, numbers or status, and the page's actions.
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
    { title, variant = "default", eyebrow, subtitle, actions, back, breadcrumbs, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: PageHeaderOwnerState = { variant, hasBack: back != null, hasActions: actions != null };

    const headingProps = resolveSlotProps<PageHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.heading },
        slotProps: slotProps?.heading,
        ownerState,
    });
    const labelLineProps = resolveSlotProps<PageHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.labelLine },
        slotProps: slotProps?.labelLine,
        ownerState,
    });
    const titleProps = resolveSlotProps<PageHeaderOwnerState, "h1", "h1">({
        ownProps: { className: styles.title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const subtitleProps = resolveSlotProps<PageHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.subtitle },
        slotProps: slotProps?.subtitle,
        ownerState,
    });
    const actionsProps = resolveSlotProps<PageHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.actions },
        slotProps: slotProps?.actions,
        ownerState,
    });

    const labelParts: ReactNode[] = [];
    if (back != null) {
        labelParts.push(
            <Link
                key="back"
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
            </Link>,
        );
    }
    if (breadcrumbs != null) {
        labelParts.push(<div key="breadcrumbs">{breadcrumbs}</div>);
    }
    if (eyebrow != null) {
        labelParts.push(<span key="eyebrow">{eyebrow}</span>);
    }

    return (
        <header
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-has-back={ownerState.hasBack ? "" : undefined}
            data-has-actions={ownerState.hasActions ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...headingProps}>
                {labelParts.length > 0 && (
                    <div {...labelLineProps}>
                        {labelParts.flatMap((part, index) =>
                            index === 0
                                ? [part]
                                : [
                                      <span key={`separator-${index}`} className={styles.separator} aria-hidden>
                                          {labelSeparator}
                                      </span>,
                                      part,
                                  ],
                        )}
                    </div>
                )}
                <h1 {...titleProps}>{title}</h1>
                {subtitle != null && <div {...subtitleProps}>{subtitle}</div>}
            </div>
            {actions != null && <div {...actionsProps}>{actions}</div>}
        </header>
    );
});
