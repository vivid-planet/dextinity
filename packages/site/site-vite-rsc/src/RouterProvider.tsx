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

function throwOutsideBrowser(): never {
    throw new Error("The router can only navigate in the browser");
}

const NavigationContext = createContext<{ router: Router; isPending: boolean }>({
    router: { push: throwOutsideBrowser, replace: throwOutsideBrowser, refresh: throwOutsideBrowser },
    isPending: false,
});

export function NavigationProvider({ router, isPending, children }: PropsWithChildren<{ router: Router; isPending: boolean }>) {
    const value = useMemo(() => ({ router, isPending }), [router, isPending]);
    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useRouter() {
    return useContext(NavigationContext).router;
}

/** Whether a client navigation is loading the next page */
export function useNavigationPending() {
    return useContext(NavigationContext).isPending;
}
