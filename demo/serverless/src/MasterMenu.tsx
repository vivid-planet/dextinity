import { MainNavigation, MainNavigationCollapsibleItem, MainNavigationItemRouterLink } from "@dextinity/admin";
import { Assets, PageTree } from "@dextinity/admin-icons";
import { useCan } from "@dextinity/serverless/client";
import { FormattedMessage } from "react-intl";

import { pageTreeCategories } from "./pageTreeConfig";

export function MasterMenu() {
    const canUseDam = useCan("dam");
    const canUsePageTree = useCan("pageTree");

    // MainNavigation clones its children, so they can't be conditional elements (false)
    const items = [
        canUsePageTree && (
            <MainNavigationCollapsibleItem
                key="pageTree"
                primary={<FormattedMessage id="menu.pageTree" defaultMessage="Page tree" />}
                icon={<PageTree />}
                openByDefault
            >
                {pageTreeCategories.map(({ category, label }) => (
                    <MainNavigationItemRouterLink key={category} primary={label} to={`/pages/${category}`} />
                ))}
            </MainNavigationCollapsibleItem>
        ),
        canUseDam && (
            <MainNavigationItemRouterLink
                key="assets"
                primary={<FormattedMessage id="menu.assets" defaultMessage="Assets" />}
                icon={<Assets />}
                to="/assets"
            />
        ),
    ].filter((item) => item !== false);

    return <MainNavigation>{items}</MainNavigation>;
}
