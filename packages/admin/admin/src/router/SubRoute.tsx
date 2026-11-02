import { createContext, type PropsWithChildren, useContext } from "react";
import { matchPath, useLocation } from "react-router";

import { AbsoluteRoute, type AbsoluteRouteProps, normalizePath, useCurrentRouteMatch } from "./RouteMatch";

interface SubRoutesContext {
    path: string;
}
const SubRoutesContext = createContext<SubRoutesContext | undefined>(undefined);

export function SubRouteIndexRoute({ children }: Pick<AbsoluteRouteProps, "children">) {
    const location = useLocation();
    const match = useCurrentRouteMatch();
    const urlPrefix = useSubRoutePrefix();

    const matchIndex = matchPath({ path: match.url, end: true }, location.pathname);

    return (
        <SubRoute path={`${urlPrefix}/index`}>
            <AbsoluteRoute path={matchIndex ? match.url : normalizePath(`/${urlPrefix}`)} exact={!!matchIndex}>
                {children}
            </AbsoluteRoute>
        </SubRoute>
    );
}

export function SubRoute({ children, path }: PropsWithChildren<{ path: string }>) {
    const subRoutePrefix = useSubRoutePrefix();
    if (path.startsWith("./")) {
        path = subRoutePrefix + path.substring(1);
    }
    return <SubRoutesContext.Provider value={{ path }}>{children}</SubRoutesContext.Provider>;
}

export function useSubRoutePrefix() {
    const routeMatch = useCurrentRouteMatch();
    const subRoutesContext = useContext(SubRoutesContext);
    let ret;
    if (subRoutesContext?.path) {
        ret = subRoutesContext.path;
        if (routeMatch.url.startsWith(subRoutesContext.path)) {
            ret = routeMatch.url;
        }
    } else {
        ret = routeMatch.url;
    }
    ret = ret.replace(/\/$/, ""); //remove trailing slash
    return ret;
}
