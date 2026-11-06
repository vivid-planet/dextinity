import { getSideNavAncestorIds, type SideNavGroup, type SideNavItem } from "@dextinity/ui";
import { isValidElement, type ReactNode, useMemo } from "react";
import { FormattedMessage, type IntlShape, type MessageDescriptor, useIntl } from "react-intl";
import { useLocation, useRouteMatch } from "react-router";

import { type MasterMenuData, useMenuFromMasterMenuData } from "../common/MasterMenu";

type MenuItem = ReturnType<typeof useMenuFromMasterMenuData>[number];

export interface AppFrameMenuEntry {
    item: SideNavItem;
    /** The labels of the entries above this one, outermost first. */
    parentLabels: string[];
    external: boolean;
}

interface AppFrameMenu {
    groups: SideNavGroup[];
    /** Every entry that leads somewhere, in menu order. */
    entries: AppFrameMenuEntry[];
    activeId: string;
    activeAncestorIds: string[];
}

export function textOfNode(node: ReactNode, intl: IntlShape): string {
    if (node == null || typeof node === "boolean") {
        return "";
    }
    if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") {
        return String(node);
    }
    if (Array.isArray(node)) {
        return node.map((child) => textOfNode(child, intl)).join("");
    }
    if (isValidElement<MessageDescriptor & { values?: Record<string, string | number>; children?: ReactNode }>(node)) {
        const { values, children, ...descriptor } = node.props;
        if (node.type === FormattedMessage && descriptor.id != null) {
            return String(intl.formatMessage(descriptor, values));
        }
        return textOfNode(children, intl);
    }
    return "";
}

function badgeOf(content: ReactNode): number | undefined {
    if (typeof content === "number") {
        return content;
    }
    if (typeof content === "string" && content.trim() !== "" && !Number.isNaN(Number(content))) {
        return Number(content);
    }
    return undefined;
}

function isPathActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(href.endsWith("/") ? href : `${href}/`);
}

/**
 * Turns the `MasterMenuData` into `SideNav` groups, the entries the command palette jumps to, and the entry of the current location.
 */
export function useAppFrameMenu(menu: MasterMenuData, ungroupedLabel: string): AppFrameMenu {
    const menuItems = useMenuFromMasterMenuData(menu);
    const intl = useIntl();
    const match = useRouteMatch();
    const { pathname } = useLocation();

    const { groups, entries } = useMemo(() => {
        const entries: AppFrameMenuEntry[] = [];

        function toSideNavItem(menuItem: MenuItem, id: string, parentLabels: string[]): SideNavItem | undefined {
            if (menuItem.type === "group") {
                return undefined;
            }
            const { menuElement } = menuItem;
            const label = textOfNode(menuElement.primary, intl);
            const sideNavItem: SideNavItem = { id, label, icon: menuElement.icon };

            if (menuItem.type === "collapsible") {
                sideNavItem.children = menuItem.items
                    .map((child, index) => toSideNavItem(child, `${id}.${index}`, [...parentLabels, label]))
                    .filter((child) => child !== undefined);
            } else if (menuItem.type === "route") {
                sideNavItem.href = `${match.url}${menuItem.menuElement.to}`;
                sideNavItem.badge = badgeOf(menuItem.menuElement.badgeContent);
                entries.push({ item: sideNavItem, parentLabels, external: false });
            } else {
                sideNavItem.href = menuItem.menuElement.href;
                entries.push({ item: sideNavItem, parentLabels, external: true });
            }
            return sideNavItem;
        }

        const groups: SideNavGroup[] = [];
        for (const [index, menuItem] of menuItems.entries()) {
            if (menuItem.type === "group") {
                groups.push({
                    label: textOfNode(menuItem.menuElement.title, intl),
                    items: menuItem.items
                        .map((child, childIndex) => toSideNavItem(child, `${index}.${childIndex}`, []))
                        .filter((child) => child !== undefined),
                });
                continue;
            }
            const sideNavItem = toSideNavItem(menuItem, `${index}`, []);
            if (sideNavItem === undefined) {
                continue;
            }
            const lastGroup = groups[groups.length - 1];
            if (lastGroup === undefined) {
                groups.push({ label: ungroupedLabel, items: [sideNavItem] });
            } else {
                lastGroup.items.push(sideNavItem);
            }
        }

        return { groups, entries };
    }, [menuItems, intl, match.url, ungroupedLabel]);

    const activeEntry = entries
        .filter((entry) => !entry.external && entry.item.href != null && isPathActive(pathname, entry.item.href))
        .sort((a, b) => (b.item.href?.length ?? 0) - (a.item.href?.length ?? 0))[0];
    const activeId = activeEntry?.item.id ?? "";

    return { groups, entries, activeId, activeAncestorIds: getSideNavAncestorIds(groups, activeId) };
}
