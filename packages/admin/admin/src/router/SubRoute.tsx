import { createContext, type PropsWithChildren, type ReactNode, useContext } from "react";
import { type PathMatch, useLocation } from "react-router";

import { RouteMatchProvider, useCurrentRouteMatch, useMatchAbsolutePath } from "./internal/routeContext";

interface SubRoutesContext {
    path: string;
}
const SubRoutesContext = createContext<SubRoutesContext | undefined>(undefined);

export interface SubRouteIndexRouteChildrenProps {
    match: PathMatch | null;
}

export function SubRouteIndexRoute({ children }: { children?: ReactNode | ((props: SubRouteIndexRouteChildrenProps) => ReactNode) }) {
    const { pathname } = useLocation();
    const matchAbsolutePath = useMatchAbsolutePath();
    const routeMatch = useCurrentRouteMatch();
    const urlPrefix = useSubRoutePrefix();

    const indexMatch = routeMatch ? matchAbsolutePath(routeMatch.url, pathname, { end: true }) : null;
    const match = indexMatch ?? matchAbsolutePath(urlPrefix, pathname, { end: false });

    return (
        <SubRoute path={`${urlPrefix}/index`}>
            <RouteMatchProvider match={match}>{typeof children === "function" ? children({ match }) : match ? children : null}</RouteMatchProvider>
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

export function ResetSubRoute({ children }: PropsWithChildren) {
    return <SubRoutesContext.Provider value={undefined}>{children}</SubRoutesContext.Provider>;
}

export function useSubRoutePrefix() {
    const routeUrl = useCurrentRouteMatch()?.url;
    const subRoutesContext = useContext(SubRoutesContext);
    let ret;
    if (subRoutesContext?.path) {
        ret = subRoutesContext.path;
        if (routeUrl && routeUrl.startsWith(subRoutesContext.path)) {
            ret = routeUrl;
        }
    } else {
        ret = routeUrl || "";
    }
    ret = ret.replace(/\/$/, ""); //remove trailing slash
    return ret;
}
