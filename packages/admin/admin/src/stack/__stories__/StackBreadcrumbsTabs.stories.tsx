import { useLocation } from "react-router";

import { RouterTab, RouterTabs } from "../../tabs/RouterTabs";
import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackLink } from "../StackLink";
import { StackSwitch } from "../Switch";

export default {
    title: "components/stack/StackBreadcrumbsTabs",
};

export const StackBreadcrumbsWithNestedTabs = {
    render: () => {
        const location = useLocation();

        return (
            <>
                <p>Pathname: {location.pathname}</p>
                <Stack topLevelTitle="Root Stack">
                    <StackBreadcrumbs />
                    <StackSwitch>
                        <StackPage name="table">
                            <RouterTabs>
                                <RouterTab label="Tab 1" path="">
                                    <p>Tab 1</p>
                                </RouterTab>
                                <RouterTab label="Tab 2" path="/tab2">
                                    <p>Tab 2</p>
                                    <StackLink pageName="edit" payload="test">
                                        Edit
                                    </StackLink>
                                </RouterTab>
                            </RouterTabs>
                        </StackPage>
                        <StackPage name="edit" title="Edit">
                            Edit
                        </StackPage>
                    </StackSwitch>
                </Stack>
            </>
        );
    },

    name: "Stack Breadcrumbs with nested Tabs",
};
