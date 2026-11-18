import { useCurrentRouteMatch } from "@dextinity/admin";
import { deepEqual } from "fast-equals";
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";

import { getPathnameBelowUrl } from "../common/getPathnameBelowUrl";
import { useCurrentUser } from "../userPermissions/hooks/currentUser";
import { contentScopeLocalStorageKey } from "./ContentScopeSelect";
import { NoContentScopeFallback } from "./noContentScopeFallback/NoContentScopeFallback";
import { defaultCreatePath } from "./utils/defaultCreatePath";
import { matchContentScope } from "./utils/matchContentScope";
import { NullValueAsString } from "./utils/nullValueAsString";

export interface ContentScope {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * The URL segments of a content scope, in order. Each segment contains the value of `dimension`, which must be one of `values`.
 *
 * For example, `[{ dimension: "domain", values: ["main", "secondary"] }, { dimension: "language", values: ["de", "en"] }]` matches `/main/en`.
 * A `null` value is written as `-` by the default `createUrl`. An empty path, for scopes without dimensions, matches every URL.
 */
export type ContentScopePath = Array<{ dimension: string; values: string[] }>;

export type ContentScopeLocation = {
    /**
     * Returns the path of the content scope, or several paths, e.g. one per group of scopes with the same dimensions. The first matching path is used.
     */
    createPath: (values: ContentScopeValues) => ContentScopePath | ContentScopePath[];
    createUrl: (scope: ContentScope) => string;
};

/**
 * The part of the URL that contains the content scope.
 */
export interface ContentScopeMatch {
    /**
     * The URL segments per dimension, e.g. `{ domain: "main", language: "en" }`.
     */
    params: Record<string, string>;
    /**
     * The URL of the content scope, e.g. `/main/en`. It's the URL of the route the children of `ContentScopeProvider` are rendered in.
     */
    url: string;
    /**
     * Whether the location is the URL of the content scope itself and not one below it.
     */
    isExact: boolean;
}

const defaultContentScopeLocation: ContentScopeLocation = { createPath: defaultCreatePath, createUrl: defaultCreateUrl };

interface ContentScopeContext {
    path?: ContentScopePath | ContentScopePath[];
    redirectPathAfterChange?: string; // define where the user should be redirected to after a scope change
    setRedirectPathAfterChange: Dispatch<SetStateAction<string | undefined>>;
    values: ContentScopeValues;
    location: ContentScopeLocation;
}

const defaultContentScopeContext: ContentScopeContext = {
    setRedirectPathAfterChange: () => {
        //
    },
    values: [],
    location: defaultContentScopeLocation,
};

type NonNull<T> = T extends null ? never : T;
type NonNullRecord<T> = {
    [P in keyof T]: NonNull<T[P]>;
};

type SetContentScopeAction = (state: ContentScope) => ContentScope;

export type UseContentScopeApi = {
    scope: ContentScope;
    setScope: (action: SetContentScopeAction) => void;
    match: ContentScopeMatch;
    setRedirectPathAfterChange: Dispatch<SetStateAction<string | undefined>>;
    supported: boolean;
    createUrl: (scope: ContentScope) => string;
    values: ContentScopeValues;
};

export type ContentScopeValues = Array<{
    scope: ContentScope;
    label?: { [P in keyof ContentScope]?: string };
}>;

// @TODO (maybe): factory for Provider (and other components) to be able to create a generic context https://ordina-jworks.github.io/architecture/2021/02/12/react-generic-context.html
// ... and get rid of "as" type-assertions
const Context = createContext<ContentScopeContext>(defaultContentScopeContext);

interface ContentScopeRouteContextValue {
    pathname: string;
    match: ContentScopeMatch;
}

const ContentScopeRouteContext = createContext<ContentScopeRouteContextValue | undefined>(undefined);

function parseScopeFromRouterMatchParams(params: NonNullRecord<ContentScope>): ContentScope {
    return Object.entries(params).reduce((a, [key, value]) => {
        return {
            ...a,
            [key]: !value || value === NullValueAsString ? null : value,
        };
    }, {} as ContentScope);
}

function formatScopeToRouterMatchParams(scope: Partial<ContentScope>): NonNullRecord<ContentScope> {
    return Object.entries(scope).reduce((a, [key, value]) => {
        return {
            ...a,
            [key]: !value || value === null ? NullValueAsString : value,
        };
    }, {} as NonNullRecord<ContentScope>);
}

function defaultCreateUrl(scope: ContentScope) {
    const formattedMatchParams = formatScopeToRouterMatchParams(scope);
    return Object.entries(formattedMatchParams).reduce((a, [, value]) => `${a}/${value}`, "");
}

// @TODO: scope can no longer be undefined
// @TODO: remove supported attribute
// @TODO: provide default empty scope "{}"
export function useContentScope(): UseContentScopeApi {
    const context = useContext(Context);
    const contentScopeRoute = useContext(ContentScopeRouteContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const routeUrl = useCurrentRouteMatch()?.url;
    const contextPath = context.path;

    const match = useMemo((): ContentScopeMatch => {
        // The match of the content scope route only applies to the location it was rendered for, and e.g. not to the one of a nested router
        if (contentScopeRoute?.pathname === pathname) {
            return contentScopeRoute.match;
        }
        if (contextPath === undefined) {
            return { params: {}, url: "/", isExact: pathname === "/" };
        }
        const contentScopeMatch = matchContentScope(contextPath, pathname)?.match;
        if (contentScopeMatch) {
            return contentScopeMatch;
        }
        // e.g. in a nested router
        const url = routeUrl ?? "/";
        return { params: {}, url, isExact: getPathnameBelowUrl(pathname, url) === "" };
    }, [contentScopeRoute, contextPath, pathname, routeUrl]);

    const matchParamsString = JSON.stringify(match.params); // convert matchParams to string, like this we can memoize or callbacks more easily
    const scope = useMemo(() => parseScopeFromRouterMatchParams(JSON.parse(matchParamsString)), [matchParamsString]);
    const redirectPath = context.redirectPathAfterChange;
    const setScope = useCallback(
        (action: SetContentScopeAction) => {
            const newContentScope = action(scope);
            const pathAfterScopePath = redirectPath || "";
            const url = context.location.createUrl(newContentScope);
            navigate({ pathname: url + pathAfterScopePath });
        },
        [scope, navigate, redirectPath, context.location],
    );

    return {
        scope,
        setScope,
        match,
        setRedirectPathAfterChange: context.setRedirectPathAfterChange,
        supported: Object.keys(scope).length > 0,
        values: context.values as ContentScopeValues, // @TODO:
        createUrl: context.location.createUrl,
    };
}

export interface ContentScopeProviderProps {
    defaultValue?: ContentScope;
    values?: ContentScopeValues;
    /**
     * Rendered as the element of a route at the URL of the content scope, so that it can contain relative routes, e.g. `<Route path="preview/*" />`.
     */
    children: (p: { match: ContentScopeMatch }) => ReactNode;
    location?: ContentScopeLocation;

    /**
     * Fallback UI for users who have no content scopes.
     *
     * @default <NoContentScopeFallback />
     */
    noContentScopeFallback?: ReactNode;
}

// The dimensions are route params so that the route pattern stays the same across scopes,
// because it's part of e.g. the reset key of RouteWithErrorBoundary and the keys of persisted data grid states.
function createRoutePath(path: ContentScopePath) {
    return `${path.map(({ dimension }) => `/:${dimension}`).join("")}/*`;
}

interface ContentScopeRouteProps {
    match: ContentScopeMatch;
    children: ContentScopeProviderProps["children"];
}

function ContentScopeRoute({ match: { params, isExact }, children }: ContentScopeRouteProps) {
    const { pathname } = useLocation();
    // Encoded like the URLs of the routes below it, which can differ from the location (see getPathnameBelowUrl)
    const url = (useCurrentRouteMatch()?.url ?? "").replace(/\/$/, "");
    const paramsString = JSON.stringify(params);
    const contentScopeRoute = useMemo(
        (): ContentScopeRouteContextValue => ({ pathname, match: { params: JSON.parse(paramsString), url, isExact } }),
        [pathname, paramsString, url, isExact],
    );

    return (
        <ContentScopeRouteContext.Provider value={contentScopeRoute}>
            {children({ match: contentScopeRoute.match })}
        </ContentScopeRouteContext.Provider>
    );
}

export function ContentScopeProvider({
    children,
    defaultValue,
    values,
    location = defaultContentScopeLocation,
    noContentScopeFallback = <NoContentScopeFallback />,
}: ContentScopeProviderProps) {
    const user = useCurrentUser();
    if (values === undefined) {
        values = user.allowedContentScopes;
        defaultValue = user.allowedContentScopes[0]?.scope;
    } else if (!values || !defaultValue) {
        throw new Error("ContentScopeProvider: values and defaultValue couldn't be evaluated from currentUser and must therefore be provided.");
    }

    const path = location.createPath(values);
    const { pathname } = useLocation();
    const matchedPath = matchContentScope(path, pathname);
    const [redirectPathAfterChange, setRedirectPathAfterChange] = useState<undefined | string>("");

    if (values.length === 0) {
        return noContentScopeFallback;
    }

    const storedScope = localStorage.getItem(contentScopeLocalStorageKey);

    let defaultUrl: string;

    if (storedScope && storedScope !== "undefined") {
        const parsedStoredScope = JSON.parse(storedScope);
        // Validate that the stored scope is in the user's allowed scopes
        const isStoredScopeAllowed = values.some((value) => deepEqual(parsedStoredScope, value.scope));

        if (isStoredScopeAllowed) {
            defaultUrl = location.createUrl(parsedStoredScope);
        } else {
            // If stored scope is not allowed, clear it and use default
            localStorage.removeItem(contentScopeLocalStorageKey);
            defaultUrl = location.createUrl(defaultValue);
        }
    } else {
        defaultUrl = location.createUrl(defaultValue);
    }

    return (
        <Context.Provider
            value={{
                path,
                redirectPathAfterChange,
                setRedirectPathAfterChange,
                values,
                location,
            }}
        >
            {matchedPath ? (
                <Routes>
                    <Route
                        path={createRoutePath(matchedPath.path)}
                        element={<ContentScopeRoute match={matchedPath.match}>{children}</ContentScopeRoute>}
                    />
                </Routes>
            ) : (
                <Navigate to={defaultUrl} replace />
            )}
        </Context.Provider>
    );
}
