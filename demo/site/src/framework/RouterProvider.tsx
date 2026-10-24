"use client";

import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

type RouterContextValue = {
    pathname: string;
    search: string;
    params: Record<string, string>;
};

const RouterContext = createContext<RouterContextValue>({ pathname: "/", search: "", params: {} });

export function RouterProvider({ pathname, search, params, children }: PropsWithChildren<RouterContextValue>) {
    const value = useMemo(() => ({ pathname, search, params }), [pathname, search, params]);
    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** The pathname as seen by the browser, i.e. before middleware rewrites */
export function usePathname() {
    return useContext(RouterContext).pathname;
}

export function useSearchParams() {
    const { search } = useContext(RouterContext);
    return useMemo(() => new URLSearchParams(search), [search]);
}

export function useParams<T extends Record<string, string>>() {
    return useContext(RouterContext).params as Partial<T>;
}
