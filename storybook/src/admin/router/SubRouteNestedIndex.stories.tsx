import { SubRouteIndexRoute, useSubRoutePrefix } from "@dextinity/admin";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useMatch } from "react-router";

import { storyRouterDecorator } from "../../story-router.decorator";

function Cmp1() {
    const urlPrefix = useSubRoutePrefix();
    const subMatch = useMatch({ path: `${urlPrefix}/sub`, end: false });

    return (
        <div>
            {subMatch ? (
                <p>Cmp1-Sub</p>
            ) : (
                <SubRouteIndexRoute>
                    <p>Cmp1-Index</p>
                    <Link to={`${urlPrefix}/sub`}>to-cmp1-sub</Link>
                </SubRouteIndexRoute>
            )}
        </div>
    );
}

function Story() {
    return (
        <div>
            <SubRouteIndexRoute>
                <Cmp1 />
            </SubRouteIndexRoute>
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
    title: "@dextinity/admin/router",
    decorators: [storyRouterDecorator()],
};

export const SubrouteNestedIndex = {
    render: () => {
        return (
            <>
                <Path />
                <Routes>
                    <Route index element={<Navigate to="/foo" replace />} />
                    <Route path="/foo/*" element={<Story />} />
                </Routes>
            </>
        );
    },

    name: "Subroute nested index",
};
