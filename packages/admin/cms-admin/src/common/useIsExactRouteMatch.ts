import { useCurrentRouteMatch } from "@dextinity/admin";
import { useLocation } from "react-router";

import { getPathnameBelowUrl } from "./getPathnameBelowUrl";

/**
 * Whether the location is the URL of the current route itself and not one below it, e.g. one of a `StackPage` or a `SubRoute`.
 */
export function useIsExactRouteMatch(): boolean {
    const routeUrl = useCurrentRouteMatch()?.url;
    const { pathname } = useLocation();
    return routeUrl !== undefined && getPathnameBelowUrl(pathname, routeUrl) === "";
}
