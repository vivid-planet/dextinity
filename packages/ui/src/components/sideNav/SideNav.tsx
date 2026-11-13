import { clsx } from "clsx";
import { type ElementType, forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode, useId, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useAppShellContext } from "../appShell/appShellContext";
import { Badge } from "../badge/Badge";
import { Icon } from "../icon/Icon";
import { Menu } from "../menu/Menu";
import { MenuGroup } from "../menu/MenuGroup";
import { MenuItem } from "../menu/MenuItem";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./SideNav.module.scss";

/**
 * An entry of the navigation, up to three levels deep.
 */
export interface SideNavItem {
    /** Stable id, used for `activeId` and `expanded`. */
    id: string;
    /** May be long; it wraps. */
    label: string;
    /** Only on the first level, where it is required: the collapsed navigation shows only the icons. */
    icon?: ReactNode;
    /** The target. Leave it out on entries with `children`: they only open their sub-entries. */
    href?: string;
    /** Sub-entries, down to the third level. */
    children?: SideNavItem[];
    /** A count, e.g. new submissions. */
    badge?: number;
}

/**
 * A section of the navigation, e.g. Content, Project, or Administration.
 */
export interface SideNavGroup {
    /** Shown as a mono label above the group's entries. */
    label: string;
    items: SideNavItem[];
}

export interface SideNavLabels {
    /** Accessible name of the navigation. */
    navigation: string;
    /** The footer button while the navigation is expanded. */
    collapse: string;
    /** The footer button while the navigation is collapsed. */
    expand: string;
}

const defaultLabels: SideNavLabels = {
    navigation: "Main navigation",
    collapse: "Collapse",
    expand: "Expand",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SideNavOwnerState = {
    collapsed: boolean;
};

export interface SideNavSlots {
    /**
     * Element for the entries with an `href`, e.g. a router's link component. It receives `href`, `className`, `aria-current`,
     * `onClick`, and `children`.
     *
     * @defaultValue `a`
     */
    link?: ElementType;
}

export interface SideNavSlotProps {
    /** Props for the `header` slot. */
    header?: SlotPropsValue<SideNavOwnerState, "div">;
    /** Props for the `footer` slot. */
    footer?: SlotPropsValue<SideNavOwnerState, "div">;
}

export interface SideNavProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "title"> {
    /** The product logo at the top. */
    logo?: ReactNode;
    /** The product's sign, shown instead of the logo while collapsed. */
    logoMark?: ReactNode;
    /** The app name, shown large below the logo. The app name appears only here, never in the top bar. */
    title: string;
    /** Tenant and environment, shown small below the app name, e.g. "Example Ltd · Production". */
    subtitle?: string;
    /** The groups and their entries. */
    groups: SideNavGroup[];
    /** The id of the current page's entry. Only one entry is active; its ancestors are highlighted. */
    activeId: string;
    /** Ids of the entries whose sub-entries are open. Start with `getSideNavAncestorIds` of the active entry. */
    expanded: string[];
    /** Called with the new list of open entries when an entry with sub-entries is toggled. */
    onExpandedChange: (expanded: string[]) => void;
    /**
     * Called when an entry without sub-entries is chosen, with the click event: call `event.preventDefault()` to navigate with a
     * client-side router instead of following the `href`.
     */
    onNavigate: (item: SideNavItem, event: MouseEvent<HTMLElement>) => void;
    /**
     * Shows only the icons; sub-entries open as a menu next to the entry. Inside `AppShell`, leave it unset to follow the shell.
     *
     * @defaultValue `false`
     */
    collapsed?: boolean;
    /** Shows the collapse button in the footer. Inside `AppShell`, leave it unset to follow the shell. */
    onCollapsedChange?: (collapsed: boolean) => void;
    /** The built-in texts. */
    labels?: Partial<SideNavLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: SideNavSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SideNavSlotProps;
}

/**
 * Returns the ids of the entries above the one with `id`, outermost first: the entries to open so the active entry is visible.
 */
export function getSideNavAncestorIds(groups: SideNavGroup[], id: string): string[] {
    function find(items: SideNavItem[], path: string[]): string[] | undefined {
        for (const item of items) {
            if (item.id === id) {
                return path;
            }
            if (item.children != null) {
                const found = find(item.children, [...path, item.id]);
                if (found != null) {
                    return found;
                }
            }
        }
        return undefined;
    }
    for (const group of groups) {
        const found = find(group.items, []);
        if (found != null) {
            return found;
        }
    }
    return [];
}

interface EntryContext {
    activeId: string;
    ancestorIds: string[];
    expanded: string[];
    onToggle: (id: string) => void;
    onNavigate: SideNavProps["onNavigate"];
    LinkSlot: ElementType;
}

function SideNavEntry({ item, level, context }: { item: SideNavItem; level: number; context: EntryContext }) {
    const childrenId = useId();
    const hasChildren = item.children != null && item.children.length > 0;
    const open = hasChildren && context.expanded.includes(item.id);
    const active = item.id === context.activeId;
    const ancestor = context.ancestorIds.includes(item.id);

    const content = (
        <>
            {level === 1 && item.icon != null && <span className={styles.itemIcon}>{item.icon}</span>}
            <span className={styles.itemLabel}>{item.label}</span>
            {item.badge != null && <Badge variant="count">{item.badge}</Badge>}
            {hasChildren && <Icon name="chev-r" className={styles.itemChevron} />}
        </>
    );
    const itemProps = {
        className: styles.item,
        "data-level": level,
        "data-active": active ? "" : undefined,
        "data-ancestor": ancestor ? "" : undefined,
    };

    return (
        <li className={styles.entry}>
            {hasChildren ? (
                <button {...itemProps} type="button" aria-expanded={open} aria-controls={childrenId} onClick={() => context.onToggle(item.id)}>
                    {content}
                </button>
            ) : item.href != null ? (
                <context.LinkSlot
                    {...itemProps}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={(event: MouseEvent<HTMLElement>) => context.onNavigate(item, event)}
                >
                    {content}
                </context.LinkSlot>
            ) : (
                <button {...itemProps} type="button" aria-current={active ? "page" : undefined} onClick={(event) => context.onNavigate(item, event)}>
                    {content}
                </button>
            )}
            {hasChildren && (
                <div id={childrenId} className={styles.children} data-open={open ? "" : undefined} data-level={level + 1} inert={!open}>
                    <ul className={styles.list}>
                        {item.children?.map((child) => (
                            <SideNavEntry key={child.id} item={child} level={level + 1} context={context} />
                        ))}
                    </ul>
                </div>
            )}
        </li>
    );
}

function FlyoutItems({ items, level, context }: { items: SideNavItem[]; level: number; context: EntryContext }) {
    return items.map((child) =>
        child.children != null && child.children.length > 0 ? (
            <MenuGroup key={child.id} label={child.label} className={styles.flyoutGroup}>
                <FlyoutItems items={child.children} level={level + 1} context={context} />
            </MenuGroup>
        ) : (
            <MenuItem
                key={child.id}
                label={child.label}
                aria-current={child.id === context.activeId ? "page" : undefined}
                data-level={level}
                className={styles.flyoutItem}
                onClick={(event) => context.onNavigate(child, event)}
            />
        ),
    );
}

function CollapsedEntry({
    item,
    context,
    flyoutOpen,
    onFlyoutOpenChange,
}: {
    item: SideNavItem;
    context: EntryContext;
    flyoutOpen: boolean;
    onFlyoutOpenChange: (open: boolean) => void;
}) {
    const hasChildren = item.children != null && item.children.length > 0;
    const active = item.id === context.activeId || context.ancestorIds.includes(item.id);
    const itemProps = {
        className: styles.item,
        "data-level": 1,
        "data-active": active ? "" : undefined,
        "data-flyout": hasChildren ? "" : undefined,
    };
    const content = (
        <>
            <span className={styles.itemIcon}>{item.icon}</span>
            {item.badge != null && (
                <Badge variant="count" className={styles.collapsedBadge}>
                    {item.badge}
                </Badge>
            )}
        </>
    );

    if (hasChildren) {
        return (
            <li className={styles.entry}>
                <Menu
                    open={flyoutOpen}
                    onOpenChange={onFlyoutOpenChange}
                    slotProps={{ positioner: { side: "right", align: "start", sideOffset: 10 } }}
                    className={styles.flyout}
                    trigger={
                        <button {...itemProps} type="button" aria-label={item.label}>
                            {content}
                        </button>
                    }
                >
                    <MenuGroup label={item.label}>
                        <FlyoutItems items={item.children ?? []} level={2} context={context} />
                    </MenuGroup>
                </Menu>
            </li>
        );
    }

    return (
        <li className={styles.entry}>
            <Tooltip content={item.label} placement="right">
                {item.href != null ? (
                    <context.LinkSlot
                        {...itemProps}
                        href={item.href}
                        aria-label={item.label}
                        aria-current={item.id === context.activeId ? "page" : undefined}
                        onClick={(event: MouseEvent<HTMLElement>) => context.onNavigate(item, event)}
                    >
                        {content}
                    </context.LinkSlot>
                ) : (
                    <button
                        {...itemProps}
                        type="button"
                        aria-label={item.label}
                        aria-current={item.id === context.activeId ? "page" : undefined}
                        onClick={(event) => context.onNavigate(item, event)}
                    >
                        {content}
                    </button>
                )}
            </Tooltip>
        </li>
    );
}

/**
 * The main navigation: app header with logo, app name, and tenant, then groups with entries up to three levels deep. Collapses to an
 * icon rail whose sub-entries open as a menu.
 */
export const SideNav = forwardRef<HTMLElement, SideNavProps>(function SideNav(
    {
        logo,
        logoMark,
        title,
        subtitle,
        groups,
        activeId,
        expanded,
        onExpandedChange,
        onNavigate,
        collapsed: collapsedProp,
        onCollapsedChange: onCollapsedChangeProp,
        labels: labelsProp,
        className,
        slots,
        slotProps,
        ...restProps
    },
    ref,
) {
    const shell = useAppShellContext();
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: SideNavOwnerState = { collapsed: collapsedProp ?? shell?.navCollapsed ?? false };
    const onCollapsedChange = onCollapsedChangeProp ?? shell?.onNavCollapsedChange;
    const groupId = useId();
    const [flyoutId, setFlyoutId] = useState<string | null>(null);

    const context: EntryContext = {
        activeId,
        ancestorIds: getSideNavAncestorIds(groups, activeId),
        expanded,
        onToggle: (id) => onExpandedChange(expanded.includes(id) ? expanded.filter((expandedId) => expandedId !== id) : [...expanded, id]),
        onNavigate: (item, event) => {
            setFlyoutId(null);
            onNavigate(item, event);
            shell?.onNavigate?.();
        },
        LinkSlot: slots?.link ?? "a",
    };

    const headerProps = resolveSlotProps<SideNavOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const footerProps = resolveSlotProps<SideNavOwnerState, "div", "div">({
        ownProps: { className: styles.footer },
        slotProps: slotProps?.footer,
        ownerState,
    });

    return (
        <nav
            aria-label={labels.navigation}
            {...restProps}
            ref={ref}
            data-collapsed={ownerState.collapsed ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...headerProps}>
                {ownerState.collapsed ? (
                    logoMark != null && <span className={styles.logoMark}>{logoMark}</span>
                ) : (
                    <>
                        {logo != null && <span className={styles.logo}>{logo}</span>}
                        <span className={styles.title}>{title}</span>
                        {subtitle != null && <span className={styles.subtitle}>{subtitle}</span>}
                    </>
                )}
            </div>
            <div className={styles.scroll}>
                {groups.map((group, index) => (
                    <div key={group.label} role="group" aria-labelledby={`${groupId}-${index}`} className={styles.group}>
                        <span id={`${groupId}-${index}`} className={styles.groupLabel}>
                            {group.label}
                        </span>
                        <ul className={styles.list}>
                            {group.items.map((item) =>
                                ownerState.collapsed ? (
                                    <CollapsedEntry
                                        key={item.id}
                                        item={item}
                                        context={context}
                                        flyoutOpen={flyoutId === item.id}
                                        onFlyoutOpenChange={(open) => setFlyoutId(open ? item.id : null)}
                                    />
                                ) : (
                                    <SideNavEntry key={item.id} item={item} level={1} context={context} />
                                ),
                            )}
                        </ul>
                    </div>
                ))}
            </div>
            {onCollapsedChange != null && (
                <div {...footerProps}>
                    <Tooltip content={labels.expand} placement="right" disabled={!ownerState.collapsed}>
                        <button
                            type="button"
                            className={styles.collapseButton}
                            aria-label={ownerState.collapsed ? labels.expand : undefined}
                            aria-expanded={!ownerState.collapsed}
                            onClick={() => onCollapsedChange(!ownerState.collapsed)}
                        >
                            <Icon name={ownerState.collapsed ? "pin-right" : "pin-left"} />
                            {!ownerState.collapsed && <span>{labels.collapse}</span>}
                        </button>
                    </Tooltip>
                </div>
            )}
        </nav>
    );
});
