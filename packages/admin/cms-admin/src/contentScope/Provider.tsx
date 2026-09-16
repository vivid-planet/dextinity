import isEqual from "lodash.isequal";
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { type match, Redirect, Route, Switch, useHistory, useRouteMatch } from "react-router";

import { useCurrentUser } from "../userPermissions/hooks/currentUser";
import { contentScopeLocalStorageKey } from "./ContentScopeSelect";
import { NoContentScopeFallback } from "./noContentScopeFallback/NoContentScopeFallback";
import { defaultCreatePath } from "./utils/defaultCreatePath";

export interface ContentScope {
    [key: string]: string | number | null | undefined;
}

type ContentScopeLocation = {
    createPath: (scope: ContentScopeValues) => string | string[];
    createUrl: (scope: ContentScope) => string;
};

const defaultContentScopeLocation = { createPath: defaultCreatePath, createUrl: defaultCreateUrl };

interface ContentScopeContext {
    path: string | string[];
    redirectPathAfterChange?: string; // define where the user should be redirected to after a scope change
    setRedirectPathAfterChange: Dispatch<SetStateAction<string | undefined>>;
    values: ContentScopeValues;
    location: ContentScopeLocation;
}

const defaultContentScopeContext: ContentScopeContext = {
    path: "/",
    setRedirectPathAfterChange: () => {
        //
    },
    values: [],
    location: defaultContentScopeLocation,
};

type ContentScopeRouterParams = Record<string, string>;

type SetContentScopeAction = (state: ContentScope) => ContentScope;

export type UseContentScopeApi = {
    scope: ContentScope;
    setScope: (action: SetContentScopeAction) => void;
    match: match;
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

const NullValueAsString = "-"; // used to represent null-values in the url

function parseScopeFromRouterMatchParams(params: ContentScopeRouterParams): ContentScope {
    return Object.entries(params).reduce((a, [key, value]) => {
        return {
            ...a,
            [key]: !value || value === NullValueAsString ? null : value,
        };
    }, {} as ContentScope);
}

function formatScopeToRouterMatchParams(scope: ContentScope): ContentScopeRouterParams {
    return Object.entries(scope).reduce((a, [key, value]) => {
        return {
            ...a,
            [key]: value === null || value === undefined || value === "" ? NullValueAsString : String(value),
        };
    }, {} as ContentScopeRouterParams);
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
    const history = useHistory();
    const matchContextScope = useRouteMatch<ContentScopeRouterParams>(context?.path || "");
    const matchDefault = useRouteMatch();
    const match = matchContextScope || matchDefault;

    const matchParamsString = JSON.stringify(match.params); // convert matchParams to string, like this we can memoize or callbacks more easily
    const scope = useMemo(() => parseScopeFromRouterMatchParams(JSON.parse(matchParamsString)), [matchParamsString]);
    const redirectPath = context.redirectPathAfterChange;
    const setScope = useCallback(
        (action: SetContentScopeAction) => {
            const newContentScope = action(scope);
            const pathAfterScopePath = redirectPath || "";
            const url = context.location.createUrl(newContentScope);
            history.push({ pathname: url + pathAfterScopePath });
        },
        [scope, history, redirectPath, context.location],
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
    children: (p: { match: match<ContentScopeRouterParams> }) => ReactNode;
    location?: ContentScopeLocation;

    /**
     * Fallback UI for users who have no content scopes.
     *
     * @default <NoContentScopeFallback />
     */
    noContentScopeFallback?: ReactNode;
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
    const match = useRouteMatch<ContentScopeRouterParams>(path);
    const [redirectPathAfterChange, setRedirectPathAfterChange] = useState<undefined | string>("");

    if (values.length === 0) {
        return noContentScopeFallback;
    }

    const storedScope = localStorage.getItem(contentScopeLocalStorageKey);

    let defaultUrl: string;

    if (storedScope && storedScope !== "undefined") {
        const parsedStoredScope = JSON.parse(storedScope);
        // Validate that the stored scope is in the user's allowed scopes
        const isStoredScopeAllowed = values.some((value) => isEqual(parsedStoredScope, value.scope));

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
                location: location as ContentScopeLocation,
            }}
        >
            <Switch>
                {match && (
                    <Route exact={false} strict={false} path={path}>
                        {children({ match })}
                    </Route>
                )}
                <Redirect to={defaultUrl} />
            </Switch>
        </Context.Provider>
    );
}
