import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";

import { ForcePromptRoute } from "../ForcePromptRoute";
import { RouterPrompt } from "../Prompt";

function Example() {
    return (
        <Routes>
            <Route
                path="/foo/*"
                element={
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
                        <Routes>
                            <Route path="sub1/*" element={<div>sub1</div>} />
                        </Routes>
                        <ForcePromptRoute path="/foo/sub2">
                            <div>sub2</div>
                        </ForcePromptRoute>
                    </RouterPrompt>
                }
            />
            <Route path="*" element={<Navigate to="/foo" replace />} />
        </Routes>
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
