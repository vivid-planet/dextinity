import {
    AiModeToolset,
    createAiModePageTreeNavigationTools,
    type MasterMenuData,
    useAiModeAdminPageNavigation,
    useContentScope,
    useUserPermissionCheck,
} from "@dextinity/cms-admin";
import { categoryToUrlParam, pageTreeCategories } from "@src/pageTree/pageTreeCategories";
import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router";

/** The toolset of the whole admin, so that the AI Mode is available on every page and can open any page of the menu. */
export function AdminAiModeToolset({ menu, children }: PropsWithChildren<{ menu: MasterMenuData }>) {
    const isAllowed = useUserPermissionCheck();
    const navigate = useNavigate();
    const { match } = useContentScope();
    const adminPageNavigation = useAiModeAdminPageNavigation(menu);

    return (
        <AiModeToolset
            id="admin"
            description="The Dextinity admin of the current content scope. The agent opens the pages of its main navigation with open_admin_page, and the editor of a page of the page tree with open_page_tree_node."
            context={{ openPage: adminPageNavigation.openPage }}
            tools={[
                ...adminPageNavigation.tools,
                // On every page rather than only in the page tree, so that the agent opens a page's editor in one step.
                ...(isAllowed("pageTree")
                    ? createAiModePageTreeNavigationTools({
                          categories: pageTreeCategories.map(({ category }) => category),
                          getEditPath: ({ id, category }) => `${match.url}/pages/pagetree/${categoryToUrlParam(category)}/${id}/edit`,
                          navigate: (path) => void navigate(path),
                      })
                    : []),
            ]}
        >
            {children}
        </AiModeToolset>
    );
}
