import { Children, Fragment, isValidElement, type PropsWithChildren, type ReactElement } from "react";
import { matchPath, useLocation } from "react-router";

import { AbsoluteRoute, type AbsoluteRouteProps, normalizePath } from "./RouteMatch";
import { SubRouteIndexRoute } from "./SubRoute";

const subRouteIndexRouteKey = "subRouteIndexRoute";

/**
 * Renders the first matching `<AbsoluteRoute>` (like `<Switch>` in React Router v5). A `<SubRouteIndexRoute>` always matches and can be used as fallback.
 */
export function AbsoluteRoutes({ children }: PropsWithChildren) {
    const location = useLocation();

    let matchingChild: ReactElement | null = null;
    let matchingChildKey = "";
    Children.forEach(children, (child) => {
        if (matchingChild || !isValidElement(child)) {
            return;
        }
        if (child.type === SubRouteIndexRoute) {
            matchingChild = child;
            matchingChildKey = subRouteIndexRouteKey;
        } else if (child.type === AbsoluteRoute) {
            const { path, exact } = child.props as AbsoluteRouteProps;
            if (matchPath({ path: normalizePath(path), end: !!exact }, location.pathname)) {
                matchingChild = child;
                matchingChildKey = path;
            }
        } else {
            throw new Error("AbsoluteRoutes must only contain AbsoluteRoute or SubRouteIndexRoute children");
        }
    });
    // keyed by the matching route to remount its children when another route matches
    return matchingChild ? <Fragment key={matchingChildKey}>{matchingChild}</Fragment> : null;
}
