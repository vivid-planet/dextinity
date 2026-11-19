import { AiModeScope, type MasterMenuData, useContentScope, useUserPermissionCheck } from "@dextinity/cms-admin";
import { type PropsWithChildren, useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";

import { findOpenAdminPage, getAdminPages } from "./adminPages";
import { createAdminTools } from "./hostTools";

/** The scope of the whole admin, so that the AI Mode is available on every page and can open any page of the menu. */
export function AdminAiModeScope({ menu, children }: PropsWithChildren<{ menu: MasterMenuData }>) {
    const intl = useIntl();
    const isAllowed = useUserPermissionCheck();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { match } = useContentScope();

    const pages = useMemo(() => getAdminPages(menu, { isAllowed, intl }), [menu, isAllowed, intl]);
    const openPage = findOpenAdminPage(pages, pathname.slice(match.url.length));

    return (
        <AiModeScope
            id="admin"
            description="The Dextinity admin of the current content scope. The user can open the pages of its main navigation with open_admin_page."
            context={{ openPage }}
            tools={createAdminTools({ pages, navigate: (path) => void navigate(path), scopeUrl: match.url })}
        >
            {children}
        </AiModeScope>
    );
}
