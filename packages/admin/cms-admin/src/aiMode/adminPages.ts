import { isValidElement, type ReactNode } from "react";
import { FormattedMessage, type IntlShape } from "react-intl";

import type { MasterMenuData } from "../common/MasterMenu";
import type { Permission } from "../userPermissions/hooks/currentUser";

/** A page of the admin's main navigation that the AI Mode can open, at a path below the content scope. */
export type AdminPage = {
    path: string;
    label: string;
};

type MasterMenuEntry = MasterMenuData[number] | NonNullable<Extract<MasterMenuData[number], { type: "collapsible" }>["items"]>[number];

/**
 * The menu's labels are React nodes, mostly a `FormattedMessage`. The agent needs text, so those are formatted with
 * `intl`; any other node gives no label.
 */
function toText(node: ReactNode, intl: IntlShape): string {
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }
    if (isValidElement<Parameters<typeof FormattedMessage>[0]>(node) && node.type === FormattedMessage) {
        return intl.formatMessage(node.props, node.props.values as Record<string, string>);
    }
    return "";
}

/**
 * The pages of the menu the user may open, with the labels of the sections they are in, e.g. "System › Redirects".
 * A route with a parameter in its path and no `to` is left out, because the agent couldn't fill in the parameter.
 */
export function getAdminPages(menu: MasterMenuData, { isAllowed, intl }: { isAllowed: (permission: Permission) => boolean; intl: IntlShape }) {
    const pages: AdminPage[] = [];

    const isPermitted = ({ requiredPermission }: MasterMenuEntry) =>
        requiredPermission === undefined || [requiredPermission].flat().some((permission) => isAllowed(permission));

    const visit = (entries: MasterMenuEntry[], sectionLabels: string[]) => {
        for (const entry of entries) {
            if (!isPermitted(entry) || entry.type === "externalLink") {
                continue;
            }

            if (entry.type === "group") {
                visit(entry.items, sectionLabels);
                continue;
            }

            const labels = [...sectionLabels, toText(entry.primary, intl)].filter((label) => label !== "");

            if (entry.type === "collapsible") {
                visit(entry.items ?? [], labels);
                continue;
            }

            const path = entry.to ?? entry.route?.path;
            if (path === undefined || path.includes(":")) {
                continue;
            }

            pages.push({ path, label: labels.join(" › ") });
        }
    };

    visit(menu, []);

    return pages;
}

/** The page whose path is the longest one the current path starts with, as a page opened from it, e.g. an edit page, is below it. */
export function findOpenAdminPage(pages: AdminPage[], pathBelowScope: string) {
    let openPage: AdminPage | null = null;
    for (const page of pages) {
        const isOpen = pathBelowScope === page.path || pathBelowScope.startsWith(`${page.path}/`);
        if (isOpen && (openPage === null || page.path.length > openPage.path.length)) {
            openPage = page;
        }
    }
    return openPage;
}
