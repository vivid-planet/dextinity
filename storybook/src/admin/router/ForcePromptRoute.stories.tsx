import { AbsoluteRoute, ForcePromptRoute, RouterPrompt } from "@dextinity/admin";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";

import { storyRouterDecorator } from "../../story-router.decorator";

function Story() {
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
                        <AbsoluteRoute path="/foo/sub1">
                            <div>sub1</div>
                        </AbsoluteRoute>
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

export default {
    title: "@dextinity/admin/router",
    decorators: [storyRouterDecorator()],
};

export const _ForcePromptRoute = {
    render: () => {
        return (
            <>
                <Path />
                <Story />
            </>
        );
    },

    name: "ForcePromptRoute",
};
