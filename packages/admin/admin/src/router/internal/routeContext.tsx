import { type ContextType, createContext, type PropsWithChildren, useCallback, useContext, useId, useMemo } from "react";
import {
    type Location,
    type PathMatch,
    renderMatches,
    type RouteMatch,
    UNSAFE_DataRouterContext,
    UNSAFE_LocationContext,
    UNSAFE_NavigationContext,
    UNSAFE_RouteContext,
    useLocation,
} from "react-router";

import { decodePathSegment, getPathnameBelowMatch, matchAbsolutePath, removeDuplicateSlashes } from "./pathMatching";

// All usages of React Router's UNSAFE_ APIs are kept in this module, so that React Router updates only affect this file.

type RouteContextValue = ContextType<typeof UNSAFE_RouteContext>;

// Holds the route matches of the closest Dextinity matcher that renders its children without matching, as long as no deeper route matched.
const UnmatchedRouteMatchesContext = createContext<RouteMatch[] | null>(null);

export interface CurrentRouteMatch {
    /**
     * The URL matched by the closest route, e.g. `/products/5/edit` (formerly `match.url`).
     */
    url: string;
    /**
     * The absolute pattern of the closest route, like `match.path` in React Router v5: Dextinity components build it from the URL they're rendered at,
     * e.g. `/products/:id/edit` for a `StackPage` below `/products` or `/products/5/edit/:id/variant` for a nested one. Routes append their path to it.
     */
    pattern: string;
}

function trimSlashes(path: string) {
    return path.replace(/^\/+|\/+$/g, "");
}

function toAbsolutePattern(pattern: string) {
    return removeDuplicateSlashes(`/${pattern}`).replace(/\/$/, "");
}

/**
 * Joins the paths of the matched routes. An absolute path, like the one of a Dextinity match, replaces the paths before it.
 */
function joinRoutePaths(matches: RouteMatch[]): string {
    let joinedPath = "";
    for (const match of matches) {
        const path = (match.route.path ?? "").replace(/\*$/, "");
        if (path.startsWith("/")) {
            joinedPath = path;
        } else if (path !== "") {
            joinedPath = `${joinedPath}/${path}`;
        }
    }
    return toAbsolutePattern(joinedPath) || "/";
}

type MatchAbsolutePathWithRouteEncoding = (pattern: string, pathname: string, options: { end: boolean }) => PathMatch | null;

/**
 * Returns `matchAbsolutePath()`, encoding the matched URL like React Router encodes the URLs of routes, so that it can be published as a route.
 */
export function useMatchAbsolutePath(): MatchAbsolutePathWithRouteEncoding {
    const encodeLocation = useContext(UNSAFE_NavigationContext)?.navigator.encodeLocation;
    return useCallback(
        (pattern, pathname, { end }) =>
            matchAbsolutePath(pattern, pathname, { end, encodePathname: encodeLocation && ((path) => encodeLocation({ pathname: path }).pathname) }),
        [encodeLocation],
    );
}

export function useAbsolutePathMatch(pattern: string, { end }: { end: boolean }): PathMatch | null {
    const { pathname } = useLocation();
    const matchAbsolutePathWithRouteEncoding = useMatchAbsolutePath();
    return useMemo(
        () => matchAbsolutePathWithRouteEncoding(pattern, pathname, { end }),
        [matchAbsolutePathWithRouteEncoding, pattern, pathname, end],
    );
}

/**
 * The closest route match, published by React Router's `<Routes>` and Dextinity's components (e.g. `StackPage`, `RouterTab`) alike.
 * Like the match of the closest `<Route>` in React Router v5. Unlike `useSubRoutePrefix()`, it ignores `SubRoute`s.
 * `null` without a router or when the closest Dextinity component renders its children without matching (e.g. a hidden tab with `forceRender`).
 */
export function useCurrentRouteMatch(): CurrentRouteMatch | null {
    const { matches } = useContext(UNSAFE_RouteContext);
    const unmatchedRouteMatches = useContext(UnmatchedRouteMatchesContext);
    return useMemo(() => {
        if (matches.length === 0 || matches === unmatchedRouteMatches) {
            return null;
        }
        return { url: matches[matches.length - 1].pathnameBase, pattern: joinRoutePaths(matches) };
    }, [matches, unmatchedRouteMatches]);
}

/**
 * The absolute pattern of the closest route, see `CurrentRouteMatch.pattern`.
 */
export function useRoutePattern(): string {
    const { matches } = useContext(UNSAFE_RouteContext);
    return useMemo(() => joinRoutePaths(matches), [matches]);
}

interface RouteMatchProviderProps {
    match: PathMatch | null;
}

/**
 * Publishes the match of a Dextinity matcher as a React Router route, so that descendants can use relative `<Routes>`, `<Link>`,
 * `useParams()` etc. with the matched URL as their base. Without a match, the parent route is kept and Dextinity's hooks see no match.
 */
export function RouteMatchProvider({ match, children }: PropsWithChildren<RouteMatchProviderProps>) {
    const routeId = useId();
    const { pathname } = useLocation();
    const parentRouteContext = useContext(UNSAFE_RouteContext);

    const url = match?.pathnameBase;
    const pattern = match ? toAbsolutePattern(match.pattern.path) : undefined;
    const serializedParams = match ? JSON.stringify(match.params) : undefined;
    const splat = match ? decodePathSegment(trimSlashes(getPathnameBelowMatch(pathname, match))) : undefined;

    const routeContext = useMemo<RouteContextValue>(() => {
        if (url === undefined || pattern === undefined || serializedParams === undefined) {
            return { ...parentRouteContext, isDataRoute: false };
        }
        const parentMatches = parentRouteContext.matches;
        const parentMatch = parentMatches[parentMatches.length - 1];
        const routeMatch: RouteMatch = {
            params: { ...parentMatch?.params, "*": splat, ...JSON.parse(serializedParams) },
            pathname: url,
            pathnameBase: url,
            // Absolute, so that the joined pattern keeps the URL this pattern was built from (see CurrentRouteMatch.pattern)
            route: { id: routeId, path: `${pattern}/*` },
        };
        return { outlet: null, matches: [...parentMatches, routeMatch], isDataRoute: false };
    }, [parentRouteContext, routeId, url, pattern, serializedParams, splat]);

    // Rendering through renderMatches() resets React Router's (unexported) data route contexts like any descendant <Routes> does.
    // Otherwise useNavigate() and <Link> would resolve relative paths against the data route instead of this route.
    return renderMatches([
        {
            params: {},
            pathname: "/",
            pathnameBase: "/",
            route: {
                id: routeId,
                element: (
                    <UNSAFE_RouteContext.Provider value={routeContext}>
                        <UnmatchedRouteMatchesContext.Provider value={match ? null : parentRouteContext.matches}>
                            {children}
                        </UnmatchedRouteMatchesContext.Provider>
                    </UNSAFE_RouteContext.Provider>
                ),
            },
        },
    ]);
}

/**
 * Returns a function returning the location of the navigation the data router currently blocks. Unlike the blocker returned by
 * `useBlocker()`, which is only updated with the next render, it reflects navigations that have been proceeded, reset, completed or
 * blocked in the meantime. Each blocked navigation has its own location object, so comparing it identifies a navigation attempt.
 */
export function useGetBlockedLocation(): () => Location | undefined {
    const dataRouterContext = useContext(UNSAFE_DataRouterContext);
    return useCallback(() => {
        const blockers = dataRouterContext?.router.state.blockers.values() ?? [];
        return Array.from(blockers).find((blocker) => blocker.state === "blocked")?.location;
    }, [dataRouterContext]);
}

const isolatedRouteContext: RouteContextValue = { outlet: null, matches: [], isDataRoute: false };

/**
 * Hides the surrounding router from its children, so that a router can be rendered inside another router.
 */
export function RouterContextIsolation({ children }: PropsWithChildren) {
    return (
        <UNSAFE_LocationContext.Provider value={null as unknown as ContextType<typeof UNSAFE_LocationContext>}>
            <UNSAFE_NavigationContext.Provider value={null as unknown as ContextType<typeof UNSAFE_NavigationContext>}>
                <UNSAFE_RouteContext.Provider value={isolatedRouteContext}>
                    <UnmatchedRouteMatchesContext.Provider value={null}>{children}</UnmatchedRouteMatchesContext.Provider>
                </UNSAFE_RouteContext.Provider>
            </UNSAFE_NavigationContext.Provider>
        </UNSAFE_LocationContext.Provider>
    );
}
