import { type PropsWithChildren, useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";

import type { MasterMenuData } from "../common/MasterMenu";
import { useDextinityConfig } from "../config/DextinityConfigContext";
import { useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import { createAdminPageNavigationTools } from "./adminPageNavigationTools";
import { findOpenAdminPage, getAdminPages } from "./adminPages";
import { AiModeToolset } from "./AiModeToolsets";
import { createPageTreeNavigationTools } from "./pageTreeTools";

/** The navigation of the admin for the AI Mode, on every page: it opens the pages of the menu and the editor of a page tree node. */
export function AiModeAdminNavigationToolset({
    menu,
    routeUrl,
    children,
}: PropsWithChildren<{
    menu: MasterMenuData;
    /** The URL the paths of the menu are relative to, usually the one of the content scope, e.g. "/main/en". */
    routeUrl: string;
}>) {
    const intl = useIntl();
    const isAllowed = useUserPermissionCheck();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { pageTree } = useDextinityConfig();

    const pages = useMemo(() => getAdminPages(menu, { isAllowed, intl }), [menu, isAllowed, intl]);
    const getBasePath = pageTree?.getBasePath;
    const pageTreeNavigationTools =
        pageTree && getBasePath && isAllowed("pageTree")
            ? createPageTreeNavigationTools({
                  categories: pageTree.categories.map(({ category }) => category),
                  getEditPath: ({ id, category }) => `${routeUrl}${getBasePath(category)}/${id}/edit`,
                  navigate: (path) => void navigate(path),
              })
            : [];

    return (
        <AiModeToolset
            id="adminNavigation"
            description={`The navigation of the Dextinity admin in the current content scope. The agent opens the pages of its main navigation with open_admin_page${pageTreeNavigationTools.length > 0 ? ", and the editor of a page of the page tree with open_page_tree_node" : ""}.`}
            context={{ openPage: findOpenAdminPage(pages, pathname.slice(routeUrl.length)) }}
            tools={[...createAdminPageNavigationTools({ pages, navigate: (path) => void navigate(path), routeUrl }), ...pageTreeNavigationTools]}
        >
            {children}
        </AiModeToolset>
    );
}
