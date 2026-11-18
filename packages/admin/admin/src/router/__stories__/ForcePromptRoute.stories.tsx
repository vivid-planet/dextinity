import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router";
import { Link } from "react-router-dom";

import { ForcePromptRoute } from "../ForcePromptRoute";
import { RouterPrompt } from "../Prompt";

function Example() {
    return (
        <Switch>
            <Route path="/foo">
                <RouterPrompt
                    message={() => {
                        return "rly?";
                    }}
                    subRoutePath="/foo"
                >
                    <ul>
                        <li>
                            <Link to="/foo/sub1">/foo/sub1</Link> (no prompt)
                        </li>
                        <li>
                            <Link to="/foo/sub2">/foo/sub2</Link> (force prompt)
                        </li>
                        <li>
                            <Link to="/foo">/foo</Link> (back)
                        </li>
                    </ul>
                    <Route path="/foo/sub1">
                        <div>sub1</div>
                    </Route>
                    <ForcePromptRoute path="/foo/sub2">
                        <div>sub2</div>
                    </ForcePromptRoute>
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
    title: "components/router/ForcePromptRoute",
};

export default meta;

type Story = StoryObj;

export const _ForcePromptRoute: Story = {
    render: () => {
        return (
            <>
                <Path />
                <Example />
            </>
        );
    },

    name: "ForcePromptRoute",
};
