import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { matchPath, useLocation } from "react-router";

import { AbsoluteRoute, type AbsoluteRouteProps, normalizePath } from "./RouteMatch";
import { SubRouteIndexRoute } from "./SubRoute";

interface AbsoluteRoutesProps {
    children?: ReactNode;
}

/**
 * Renders the first matching `<AbsoluteRoute>` (like `<Switch>` in React Router v5). A `<SubRouteIndexRoute>` always matches and can be used as fallback.
 */
export function AbsoluteRoutes({ children }: AbsoluteRoutesProps) {
    const location = useLocation();

    let matchingChild: ReactElement | null = null;
    let matchingChildIndex = -1;
    Children.forEach(children, (child, index) => {
        if (matchingChild || !isValidElement(child)) {
            return;
        }
        if (child.type === SubRouteIndexRoute) {
            matchingChild = child;
            matchingChildIndex = index;
        } else if (child.type === AbsoluteRoute) {
            const { path, exact } = child.props as AbsoluteRouteProps;
            if (matchPath({ path: normalizePath(path), end: !!exact }, location.pathname)) {
                matchingChild = child;
                matchingChildIndex = index;
            }
        } else {
            throw new Error("AbsoluteRoutes must only contain AbsoluteRoute or SubRouteIndexRoute children");
        }
    });
    // keyed by index to remount when another child matches
    return matchingChild ? <Fragment key={matchingChildIndex}>{matchingChild}</Fragment> : null;
}
