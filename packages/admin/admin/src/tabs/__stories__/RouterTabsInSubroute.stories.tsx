import { useEffect, useState } from "react";
import { Redirect, Route, Switch, useLocation, useRouteMatch } from "react-router";

import { SubRoute } from "../../router/SubRoute";
import { RouterTab, RouterTabs } from "../RouterTabs";

function Story() {
    const match = useRouteMatch();
    return (
        <div>
            <SubRoute path={`${match.url}/cmp1`}>
                <RouterTabs>
                    <RouterTab label="Tab 1" path="">
                        Tab 1 Content
                    </RouterTab>
                    <RouterTab label="Tab 2" path="/form2">
                        Tab 2 Content
                    </RouterTab>
                </RouterTabs>
            </SubRoute>
        </div>
    );
}

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

export default {
    title: "components/tabs/RouterTabs in SubRoute",
};

export const RouterTabsInSubRoute = {
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

    name: "Router Tabs in SubRoute",
};
