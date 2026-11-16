import { RouterPrompt } from "@dextinity/admin";
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
                            return "sure?";
                        }}
                        subRoutePath="/foo/s"
                    >
                        <Link to="/foo/s/sub">subLink</Link>
                        <Link to="/foo">fooLink</Link>
                        <div>foo</div>
                        <Routes>
                            <Route path="s/sub/*" element={<div>sub</div>} />
                        </Routes>
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

export const NestedRouteWithNonSubPathRouteInPrompt = {
    render: () => {
        return (
            <>
                <Path />
                <Story />
            </>
        );
    },

    name: "Nested route with non-sub-path route in Prompt",
};
