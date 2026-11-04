import { Redirect, Route, Switch } from "react-router";

import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { useStackSwitch } from "../Switch";

function Story() {
    const [StackSwitch, api] = useStackSwitch();
    // demonstrate how to access the StackSwitchApi in the component where StackSwich is created (useStackSwitchApi doesn't work)
    return (
        <div>
            <button
                onClick={() => {
                    api.activatePage("page2", "foo");
                }}
            >
                page2
            </button>
            <Stack topLevelTitle="Stack">
                <StackBreadcrumbs />
                <StackSwitch>
                    <StackPage name="page1">
                        <div>page1</div>
                    </StackPage>
                    <StackPage name="page2">
                        <div>page2</div>
                    </StackPage>
                </StackSwitch>
            </Stack>
        </div>
    );
}

export default {
    title: "components/stack/StackRefApi",
};

export const StackRefApi = () => {
    return (
        <Switch>
            <Route exact path="/">
                <Redirect to="/foo" />
            </Route>
            <Route path="/foo">
                <Story />
            </Route>
        </Switch>
    );
};
