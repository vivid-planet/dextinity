import { AiModeToolset, type MasterMenuData, useContentScope, useUserPermissionCheck } from "@dextinity/cms-admin";
import { type PropsWithChildren, useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";

import { findOpenAdminPage, getAdminPages } from "./adminPages";
import { createAdminTools } from "./adminTools";
import { createPageTreeNavigationTools } from "./pageTreeTools";

/** The toolset of the whole admin, so that the AI Mode is available on every page and can open any page of the menu. */
export function AdminAiModeToolset({ menu, children }: PropsWithChildren<{ menu: MasterMenuData }>) {
    const intl = useIntl();
    const isAllowed = useUserPermissionCheck();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { match } = useContentScope();

    const pages = useMemo(() => getAdminPages(menu, { isAllowed, intl }), [menu, isAllowed, intl]);
    const openPage = findOpenAdminPage(pages, pathname.slice(match.url.length));

    return (
        <AiModeToolset
            id="admin"
            description="The Dextinity admin of the current content scope. The agent opens the pages of its main navigation with open_admin_page, and the editor of a page of the page tree with open_page_tree_node."
            context={{ openPage }}
            tools={[
                ...createAdminTools({ pages, navigate: (path) => void navigate(path), scopeUrl: match.url }),
                // On every page rather than only in the page tree, so that the agent opens a page's editor in one step.
                ...(isAllowed("pageTree") ? createPageTreeNavigationTools({ navigate: (path) => void navigate(path), scopeUrl: match.url }) : []),
            ]}
        >
            {children}
        </AiModeToolset>
    );
}
