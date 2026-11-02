import { AbsoluteRoute, AbsoluteRoutes, SubRoute, SubRouteIndexRoute, useSubRoutePrefix } from "@dextinity/admin";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";

import { storyRouterDecorator } from "../../story-router.decorator";

function Cmp1() {
    const urlPrefix = useSubRoutePrefix();
    return (
        <AbsoluteRoutes>
            <AbsoluteRoute path={`${urlPrefix}/sub`}>
                <div>Cmp1 Sub</div>
            </AbsoluteRoute>
            <SubRouteIndexRoute>
                <div>
                    <Link to={`${urlPrefix}/sub`}>Cmp1 SubLink</Link>
                </div>
            </SubRouteIndexRoute>
        </AbsoluteRoutes>
    );
}

function Cmp2() {
    const urlPrefix = useSubRoutePrefix();
    return (
        <AbsoluteRoutes>
            <AbsoluteRoute path={`${urlPrefix}/sub`}>
                <div>
                    <Link to={`${urlPrefix}/sub`}>Sub</Link>
                    <br />
                    <Link to={`${urlPrefix}/sub/sub2`}>Sub2</Link>
                </div>
                <AbsoluteRoutes>
                    <AbsoluteRoute path={`${urlPrefix}/sub/sub2`}>
                        <div>Cmp2 Sub2</div>
                    </AbsoluteRoute>
                    <AbsoluteRoute path={`${urlPrefix}/sub`}>
                        <div>Cmp2 Sub</div>
                    </AbsoluteRoute>
                </AbsoluteRoutes>
            </AbsoluteRoute>
            <SubRouteIndexRoute>
                <div>
                    <Link to={`${urlPrefix}/sub`}>Cmp2 SubLink</Link>
                </div>
            </SubRouteIndexRoute>
        </AbsoluteRoutes>
    );
}

function Story() {
    const urlPrefix = useSubRoutePrefix();
    return (
        <div>
            <SubRoute path={`${urlPrefix}/cmp1`}>
                <div>
                    <Cmp1 />
                </div>
            </SubRoute>
            <SubRoute path={`${urlPrefix}/cmp2`}>
                <div>
                    <Cmp2 />
                </div>
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
    title: "@dextinity/admin/router",
    decorators: [storyRouterDecorator()],
};

export const Subroute = () => {
    return (
        <>
            <Path />
            <Routes>
                <Route path="/" element={<Navigate to="/foo" replace />} />
                <Route path="/foo/*" element={<Story />} />
            </Routes>
        </>
    );
};
