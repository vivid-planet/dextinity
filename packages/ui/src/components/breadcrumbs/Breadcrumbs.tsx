import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type MouseEvent, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { Link, type LinkProps } from "../link/Link";
import { Menu } from "../menu/Menu";
import { MenuItem } from "../menu/MenuItem";
import styles from "./Breadcrumbs.module.scss";

export type BreadcrumbsSeparator = "/" | "›" | "·";

type BreadcrumbsVariant = "default" | "label";

export interface BreadcrumbsItem {
    /** The name of the level, e.g. "Teaser grid". */
    label: string;
    /** The destination of the level. */
    href?: string;
    /** Called when the level is chosen, e.g. to navigate with the router. */
    onClick?: () => void;
    /** Render the link as a custom element, e.g. the router's link component. Ignored for the current level. */
    render?: LinkProps["render"];
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BreadcrumbsOwnerState = {
    variant: BreadcrumbsVariant;
    collapsed: boolean;
};

export interface BreadcrumbsSlotProps {
    /** Props for the `list` slot, the ordered list of levels. */
    list?: SlotPropsValue<BreadcrumbsOwnerState, "ol">;
    /** Props for each `item` slot. */
    item?: SlotPropsValue<BreadcrumbsOwnerState, "li">;
    /** Props for each `separator` slot. */
    separator?: SlotPropsValue<BreadcrumbsOwnerState, "span">;
    /** Props for the `current` slot, the last level. */
    current?: SlotPropsValue<BreadcrumbsOwnerState, "span">;
    /** Props for the `moreButton` slot, the button that lists the collapsed levels. */
    moreButton?: SlotPropsValue<BreadcrumbsOwnerState, "button">;
}

export interface BreadcrumbsLabels {
    /** The accessible name of the navigation landmark. */
    breadcrumbs: string;
    /** The accessible name of the button that lists the collapsed levels. */
    showCollapsed: string;
}

const defaultLabels: BreadcrumbsLabels = {
    breadcrumbs: "Breadcrumbs",
    showCollapsed: "Show hidden levels",
};

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /** The path, top level first. The last item is the current page and is never a link. */
    items: readonly BreadcrumbsItem[];
    /**
     * The most levels shown. Middle levels collapse into a "more" button with a menu.
     *
     * @defaultValue `4`
     */
    maxItems?: number;
    /**
     * The character between the levels.
     *
     * @defaultValue `"·"`
     */
    separator?: BreadcrumbsSeparator;
    /**
     * `default` for nested blocks in an edit panel, `label` for the mono label line above a page title.
     *
     * @defaultValue `"default"`
     */
    variant?: BreadcrumbsVariant;
    /** Built-in text for assistive technology. */
    labels?: Partial<BreadcrumbsLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: BreadcrumbsSlotProps;
}

type VisibleEntry = { kind: "item"; item: BreadcrumbsItem; index: number } | { kind: "collapsed"; items: BreadcrumbsItem[] };

function getVisibleEntries(items: readonly BreadcrumbsItem[], maxItems: number): VisibleEntry[] {
    const entries = items.map((item, index): VisibleEntry => ({ kind: "item", item, index }));
    if (items.length <= maxItems || items.length < 3) {
        return entries;
    }
    const tailLength = Math.max(1, maxItems - 2);
    return [entries[0], { kind: "collapsed", items: items.slice(1, items.length - tailLength) }, ...entries.slice(items.length - tailLength)];
}

/**
 * Where am I: the path from the top level to the current page. Earlier levels are links, the current one is plain text.
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
    { items, maxItems = 4, separator = "·", variant = "default", labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const [collapsedMenuOpen, setCollapsedMenuOpen] = useState(false);
    const labels = { ...defaultLabels, ...labelsProp };
    const entries = getVisibleEntries(items, maxItems);
    const ownerState: BreadcrumbsOwnerState = { variant, collapsed: entries.some((entry) => entry.kind === "collapsed") };

    const listProps = resolveSlotProps<BreadcrumbsOwnerState, "ol", "ol">({
        ownProps: { className: styles.list },
        slotProps: slotProps?.list,
        ownerState,
    });
    const itemProps = resolveSlotProps<BreadcrumbsOwnerState, "li", "li">({
        ownProps: { className: styles.item },
        slotProps: slotProps?.item,
        ownerState,
    });
    const separatorProps = resolveSlotProps<BreadcrumbsOwnerState, "span", "span">({
        ownProps: { className: styles.separator, "aria-hidden": true },
        slotProps: slotProps?.separator,
        ownerState,
    });
    const currentProps = resolveSlotProps<BreadcrumbsOwnerState, "span", "span">({
        ownProps: { className: styles.current, "aria-current": "page" },
        slotProps: slotProps?.current,
        ownerState,
    });
    const moreButtonProps = resolveSlotProps<BreadcrumbsOwnerState, "button", "button">({
        ownProps: { className: styles.moreButton, type: "button", "aria-label": labels.showCollapsed },
        slotProps: slotProps?.moreButton,
        ownerState,
    });

    function chooseCollapsedItem(item: BreadcrumbsItem) {
        if (item.onClick != null) {
            item.onClick();
        } else if (item.href != null) {
            window.location.assign(item.href);
        }
    }

    return (
        <nav
            aria-label={labels.breadcrumbs}
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-collapsed={ownerState.collapsed ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <ol {...listProps}>
                {entries.map((entry, position) => {
                    const isLast = position === entries.length - 1;
                    let content;
                    if (entry.kind === "collapsed") {
                        content = (
                            <Menu
                                open={collapsedMenuOpen}
                                onOpenChange={setCollapsedMenuOpen}
                                trigger={
                                    <button {...moreButtonProps}>
                                        <Icon name="more" />
                                    </button>
                                }
                            >
                                {entry.items.map((item, index) => (
                                    <MenuItem key={index} label={item.label} onClick={() => chooseCollapsedItem(item)} />
                                ))}
                            </Menu>
                        );
                    } else if (isLast) {
                        content = <span {...currentProps}>{entry.item.label}</span>;
                    } else {
                        const { item } = entry;
                        content = (
                            <Link
                                className={styles.link}
                                color={variant === "label" ? "secondary" : "accent"}
                                href={item.href}
                                render={item.render}
                                onClick={
                                    item.onClick == null
                                        ? undefined
                                        : (event: MouseEvent<HTMLAnchorElement>) => {
                                              event.preventDefault();
                                              item.onClick?.();
                                          }
                                }
                            >
                                {item.label}
                            </Link>
                        );
                    }
                    return (
                        <li key={entry.kind === "item" ? entry.index : "collapsed"} {...itemProps}>
                            {content}
                            {!isLast && <span {...separatorProps}>{separator}</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
});
