import { useEffect, useState } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router";

import { SubRoute, useSubRoutePrefix } from "../../router/SubRoute";
import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackLink } from "../StackLink";
import { StackSwitch } from "../Switch";

function Story() {
    const urlPrefix = useSubRoutePrefix();
    return (
        <Stack topLevelTitle="Stack">
            <StackBreadcrumbs />
            <SubRoute path={`${urlPrefix}/first`}>
                <StackSwitch>
                    <StackPage name="page1">
                        <p>First Page1</p>
                        <StackLink pageName="page2" payload="test">
                            activate page2
                        </StackLink>
                    </StackPage>
                    <StackPage name="page2">First Page2</StackPage>
                </StackSwitch>
            </SubRoute>
            <SubRoute path={`${urlPrefix}/second`}>
                <StackSwitch>
                    <StackPage name="page1">
                        <p>Second Page1</p>
                        <StackLink pageName="page2" payload="test">
                            activate page2
                        </StackLink>
                    </StackPage>
                    <StackPage name="page2">Second Page2</StackPage>
                </StackSwitch>
            </SubRoute>
        </Stack>
    );
}

function Path() {
    const location = useLocation();
    const [, rerender] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => {
            rerender(new Date().getTime());
        }, 100);
        return () => clearTimeout(timer);
    }, []);
    return <div>{location.pathname}</div>;
}

export default {
    title: "components/stack/StackNestedOneStack",
};

export const StackNestedOneStack = {
    render: () => {
        return (
            <>
                <Path />
                <Switch>
                    <Route exact path="/">
                        <Redirect to="/foo" />
                    </Route>
                    <Route path="/foo">
                        <Story />
                    </Route>
                </Switch>
            </>
        );
    },

    name: "Stack Nested one Stack",
};
