import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router";
import { Link } from "react-router-dom";

import { SubRouteIndexRoute, useSubRoutePrefix } from "../SubRoute";

function Cmp1() {
    const urlPrefix = useSubRoutePrefix();
    return (
        <div>
            <Switch>
                <Route path={`${urlPrefix}/sub`}>
                    <p>Cmp1-Sub</p>
                </Route>
                <SubRouteIndexRoute>
                    <p>Cmp1-Index</p>
                    <Link to={`${urlPrefix}/sub`}>to-cmp1-sub</Link>
                </SubRouteIndexRoute>
            </Switch>
        </div>
    );
}

function Example() {
    return (
        <div>
            <Switch>
                <SubRouteIndexRoute>
                    <Cmp1 />
                </SubRouteIndexRoute>
                <Route path="/sub">Sub</Route>
            </Switch>
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

const meta: Meta = {
    title: "components/router/SubRouteNestedIndex",
};

export default meta;

type Story = StoryObj;

export const SubrouteNestedIndex: Story = {
    render: () => {
        return (
            <>
                <Path />
                <Switch>
                    <Route exact path="/">
                        <Redirect to="/foo" />
                    </Route>
                    <Route path="/foo">
                        <Example />
                    </Route>
                </Switch>
            </>
        );
    },

    name: "Subroute nested index",
};
