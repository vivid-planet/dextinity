import { type PropsWithChildren, type ReactNode, useContext, useMemo } from "react";
import {
    matchPath,
    type Params,
    type PathMatch,
    type RouteMatch as ReactRouterRouteMatch,
    UNSAFE_RouteContext as RouteContext,
    useLocation,
} from "react-router";

export interface CurrentRouteMatch {
    /**
     * The matched portion of the URL, e.g. `/products/123/edit`
     */
    url: string;
    /**
     * The absolute route pattern, e.g. `/products/:id/edit`
     */
    path: string;
    params: Params;
}

export function normalizePath(path: string) {
    const deduplicated = path.replace(/\/+/g, "/");
    if (deduplicated === "/") {
        return deduplicated;
    }
    return deduplicated.replace(/\/$/, "");
}

function stripSplat(path: string) {
    return path.replace(/\/?\*$/, "");
}

function joinPaths(...paths: string[]) {
    return normalizePath(`/${paths.join("/")}`);
}

function getAbsoluteRoutePattern(matches: ReactRouterRouteMatch[]) {
    let pattern = "/";
    for (const match of matches) {
        const routePath = stripSplat(match.route.path ?? "");
        pattern = routePath.startsWith("/") ? normalizePath(routePath) : joinPaths(pattern, routePath);
    }
    return pattern;
}

/**
 * Returns the match of the closest route, similar to `useRouteMatch()` in React Router v5.
 * Works for routes rendered by React Router's `<Routes>` and for routes rendered by Dextinity components (e.g. `StackSwitch`, `RouterTabs`).
 */
export function useCurrentRouteMatch(): CurrentRouteMatch {
    const { matches } = useContext(RouteContext);
    return useMemo(() => {
        const lastMatch = matches[matches.length - 1];
        if (!lastMatch) {
            return { url: "/", path: "/", params: {} };
        }
        return { url: normalizePath(lastMatch.pathnameBase), path: getAbsoluteRoutePattern(matches), params: lastMatch.params };
    }, [matches]);
}

/**
 * Matches an absolute path pattern against the current location. Matches by prefix unless `exact` is set (like `<Route>` in React Router v5).
 */
export function useAbsoluteMatch(path: string | undefined, { exact = false }: { exact?: boolean } = {}) {
    const location = useLocation();
    if (path === undefined) {
        return null;
    }
    return matchPath({ path: normalizePath(path), end: exact }, location.pathname);
}

function removeLeadingSegments(path: string, segmentCount: number) {
    const segments = path.split("/").filter((segment) => segment !== "");
    return segments.slice(segmentCount).join("/");
}

/**
 * Provides the given absolute match as React Router route context to its children,
 * so `useParams()`, relative links and descendant `<Routes>` work relative to the match.
 * The rendered tree is stable regardless of whether the match is set, to prevent remounting children.
 */
export function RouteMatchProvider({ match, path, children }: PropsWithChildren<{ match: PathMatch | null; path: string }>) {
    const parentContext = useContext(RouteContext);

    const value = useMemo(() => {
        if (!match) {
            return parentContext;
        }
        const parentMatch: ReactRouterRouteMatch | undefined = parentContext.matches[parentContext.matches.length - 1];
        const parentPathnameBase = normalizePath(parentMatch?.pathnameBase ?? "/");
        const normalizedPath = normalizePath(path);
        const parentSegmentCount = parentPathnameBase.split("/").filter((segment) => segment !== "").length;
        const relativePath =
            parentPathnameBase === "/" || normalizedPath.startsWith(`${parentPathnameBase}/`) || normalizedPath === parentPathnameBase
                ? removeLeadingSegments(normalizedPath, parentSegmentCount)
                : normalizedPath;

        const routeMatch: ReactRouterRouteMatch = {
            params: { ...parentMatch?.params, ...match.params },
            pathname: match.pathname,
            pathnameBase: match.pathnameBase,
            route: { path: relativePath === "" ? "*" : `${relativePath}/*` },
        };
        return {
            outlet: null,
            isDataRoute: false,
            matches: [...parentContext.matches, routeMatch],
        };
    }, [match, parentContext, path]);

    return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export interface AbsoluteRouteProps {
    path: string;
    exact?: boolean;
    children?: ReactNode | ((match: PathMatch | null) => ReactNode);
}

/**
 * Like `<Route>` in React Router v5: matches an absolute path by prefix and can be rendered anywhere (not only inside `<Routes>`).
 * Function children are always rendered and receive the match (or `null`).
 */
export function AbsoluteRoute({ path, exact, children }: AbsoluteRouteProps) {
    const match = useAbsoluteMatch(path, { exact });
    return (
        <RouteMatchProvider match={match} path={path}>
            {typeof children === "function" ? children(match) : match ? children : null}
        </RouteMatchProvider>
    );
}
