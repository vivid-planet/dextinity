import { SubRoute, SubRouteIndexRoute, useSubRoutePrefix } from "@dextinity/admin";
import { useEffect, useState } from "react";
import { Redirect, Route, Switch, useLocation, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";

import { storyRouterDecorator } from "../../story-router.decorator";

function Cmp1() {
    const urlPrefix = useSubRoutePrefix();
    return (
        <Switch>
            <Route path={`${urlPrefix}/sub`}>
                <div>Cmp1 Sub</div>
            </Route>
            <SubRouteIndexRoute>
                <div>
                    <Link to={`${urlPrefix}/sub`}>Cmp1 SubLink</Link>
                </div>
            </SubRouteIndexRoute>
        </Switch>
    );
}

function Cmp2() {
    const urlPrefix = useSubRoutePrefix();
    return (
        <Switch>
            <Route path={`${urlPrefix}/sub`}>
                <div>
                    <Link to={`${urlPrefix}/sub`}>Sub</Link>
                    <br />
                    <Link to={`${urlPrefix}/sub/sub2`}>Sub2</Link>
                </div>
                <Switch>
                    <Route path={`${urlPrefix}/sub/sub2`}>
                        <div>Cmp2 Sub2</div>
                    </Route>
                    <Route>
                        <div>Cmp2 Sub</div>
                    </Route>
                </Switch>
            </Route>
            <SubRouteIndexRoute>
                <div>
                    <Link to={`${urlPrefix}/sub`}>Cmp2 SubLink</Link>
                </div>
            </SubRouteIndexRoute>
        </Switch>
    );
}

function Story() {
    const match = useRouteMatch();
    return (
        <div>
            <SubRoute path={`${match.url}/cmp1`}>
                <div>
                    <Cmp1 />
                </div>
            </SubRoute>
            <SubRoute path={`${match.url}/cmp2`}>
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
};
