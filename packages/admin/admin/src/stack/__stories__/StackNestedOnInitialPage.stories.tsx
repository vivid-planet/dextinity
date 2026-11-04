import { useEffect, useState } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router";

import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackLink } from "../StackLink";
import { StackSwitch } from "../Switch";

function Path() {
    const location = useLocation();
    const [, rerender] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => {
            rerender(new Date().getTime());
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    return <div>{location.pathname}</div>;
}
function Page2() {
    return (
        <Stack topLevelTitle="Stack Nested">
            <StackBreadcrumbs />
            <StackSwitch>
                <StackPage name="page1">
                    <StackLink payload="test" pageName="page2-2">
                        activate page2-2
                    </StackLink>
                </StackPage>
                <StackPage name="page2-2">page2</StackPage>
            </StackSwitch>
        </Stack>
    );
}

function Story() {
    return (
        <>
            <Path />
            <Stack topLevelTitle="Stack">
                <StackBreadcrumbs />
                <StackSwitch>
                    <StackPage name="page1">
                        <Page2 />
                    </StackPage>
                    <StackPage name="page2">page2</StackPage>
                </StackSwitch>
            </Stack>
        </>
    );
}

export default {
    title: "components/stack/StackNestedOnInitialPage",
};

export const StackNestedOnInitialPage = () => {
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
