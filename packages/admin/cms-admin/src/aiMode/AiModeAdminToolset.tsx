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

/** The toolset of the whole admin, so that the AI Mode is available on every page and can open any page of the menu. */
export function AiModeAdminToolset({
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
    const getNodeEditPath = pageTree?.getNodeEditPath;
    const pageTreeNavigationTools =
        pageTree && getNodeEditPath && isAllowed("pageTree")
            ? createPageTreeNavigationTools({
                  categories: pageTree.categories.map(({ category }) => category),
                  getEditPath: (node) => `${routeUrl}${getNodeEditPath(node)}`,
                  navigate: (path) => void navigate(path),
              })
            : [];

    return (
        <AiModeToolset
            id="admin"
            description={`The Dextinity admin of the current content scope. The agent opens the pages of its main navigation with open_admin_page${pageTreeNavigationTools.length > 0 ? ", and the editor of a page of the page tree with open_page_tree_node" : ""}.`}
            context={{ openPage: findOpenAdminPage(pages, pathname.slice(routeUrl.length)) }}
            tools={[...createAdminPageNavigationTools({ pages, navigate: (path) => void navigate(path), routeUrl }), ...pageTreeNavigationTools]}
        >
            {children}
        </AiModeToolset>
    );
}
