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

type NavigateOptions = {
    /** Scrolls to the top or the hash of the URL after navigating, defaults to true */
    scroll?: boolean;
};

export type Router = {
    push: (href: string, options?: NavigateOptions) => void;
    replace: (href: string, options?: NavigateOptions) => void;
    /** Re-renders the current page on the server */
    refresh: () => void;
};

let browserRouter: Router | undefined;

export function setBrowserRouter(router: Router) {
    browserRouter = router;
}

function getBrowserRouter() {
    if (!browserRouter) {
        throw new Error("The router can only navigate in the browser");
    }
    return browserRouter;
}

const router: Router = {
    push: (href, options) => getBrowserRouter().push(href, options),
    replace: (href, options) => getBrowserRouter().replace(href, options),
    refresh: () => getBrowserRouter().refresh(),
};

export function useRouter() {
    return router;
}
