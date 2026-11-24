import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router";
import { Link } from "react-router-dom";

import { RouterPrompt } from "../Prompt";

function Example() {
    return (
        <Switch>
            <Route path="/foo">
                <RouterPrompt
                    message={() => {
                        return "sure?";
                    }}
                    subRoutePath="/foo/s"
                >
                    <Link to="/foo/s/sub">subLink</Link>
                    <Link to="/foo">fooLink</Link>
                    <Route path="/foo">
                        <div>foo</div>
                    </Route>
                    <Route path="/foo/s/sub">
                        <div>sub</div>
                    </Route>
                </RouterPrompt>
            </Route>
            <Redirect to="/foo" />
        </Switch>
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
    title: "components/router/Prompt",
};

export default meta;

type Story = StoryObj;

export const NestedRouteWithNonSubPathRouteInPrompt: Story = {
    render: () => {
        return (
            <>
                <Path />
                <Example />
            </>
        );
    },

    name: "Nested route with non-sub-path route in Prompt",
};
