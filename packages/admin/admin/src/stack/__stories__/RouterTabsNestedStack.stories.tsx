import { Button } from "../../common/buttons/Button";
import { RouterTab, RouterTabs } from "../../tabs/RouterTabs";
import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackSwitch, StackSwitchApiContext } from "../Switch";

export default {
    title: "components/stack/RouterTabsNestedStack",
};

export const RouterTabsWithNestedStack = {
    render: () => {
        return (
            <Stack topLevelTitle="Root Stack">
                <StackBreadcrumbs />
                <RouterTabs>
                    <RouterTab label="Page 1" path="">
                        <Stack topLevelTitle="Nested Stack">
                            <StackBreadcrumbs />
                            <StackSwitch>
                                <StackPage name="table">
                                    <StackSwitchApiContext.Consumer>
                                        {(stackApi) => <Button onClick={() => stackApi.activatePage("edit", "test")}>Test</Button>}
                                    </StackSwitchApiContext.Consumer>
                                </StackPage>
                                <StackPage name="edit" title="Edit">
                                    <RouterTabs>
                                        <RouterTab label="Page 3" path="">
                                            Page 3
                                        </RouterTab>
                                    </RouterTabs>
                                </StackPage>
                            </StackSwitch>
                        </Stack>
                    </RouterTab>
                    <RouterTab label="Page 2" path="/page2">
                        Page 2
                    </RouterTab>
                </RouterTabs>
            </Stack>
        );
    },

    name: "RouterTabs with nested Stack",
};
