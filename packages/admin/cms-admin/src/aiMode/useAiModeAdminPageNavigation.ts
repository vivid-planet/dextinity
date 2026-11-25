import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";

import type { MasterMenuData } from "../common/MasterMenu";
import { useContentScope } from "../contentScope/Provider";
import { useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import { createAdminPageNavigationTools } from "./adminPageNavigationTools";
import { findOpenAdminPage, getAdminPages } from "./adminPages";

/**
 * Lets the AI Mode open the pages of the master menu the user may open, with `open_admin_page`. Add the tools to a
 * toolset that is on every page, such as one around the routes of the master menu, and `openPage` to its context, so
 * that the agent knows which page of the menu the user is on, also below it, e.g. on an edit page.
 *
 * @experimental
 */
export function useAiModeAdminPageNavigation(menu: MasterMenuData) {
    const intl = useIntl();
    const isAllowed = useUserPermissionCheck();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { match } = useContentScope();

    const pages = useMemo(() => getAdminPages(menu, { isAllowed, intl }), [menu, isAllowed, intl]);

    return {
        tools: createAdminPageNavigationTools({ pages, navigate: (path) => void navigate(path), scopeUrl: match.url }),
        openPage: findOpenAdminPage(pages, pathname.slice(match.url.length)),
    };
}
