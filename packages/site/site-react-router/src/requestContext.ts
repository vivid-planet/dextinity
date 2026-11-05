import { AsyncLocalStorage } from "node:async_hooks";

import type { RouterContextProvider } from "react-router";

const requestContextStorage = new AsyncLocalStorage<Readonly<RouterContextProvider>>();

/**
 * Makes the context of the request, which the middlewares fill, available to the server components via `getRequestContext()`.
 * Wrap the rendering of the RSC payload in `entry.rsc.tsx` with it.
 *
 * @example
 * const requestContext = new RouterContextProvider();
 * const response = await runWithRequestContext(requestContext, () => matchRSCServerRequest({ request, requestContext, ... }));
 */
export function runWithRequestContext<T>(requestContext: Readonly<RouterContextProvider>, callback: () => T): T {
    return requestContextStorage.run(requestContext, callback);
}

/**
 * The context of the current request in server components, which only receive the context of React Router in loaders and middlewares
 *
 * @example
 * const { domain } = getRequestContext().get(siteContext);
 */
export function getRequestContext(): Readonly<RouterContextProvider> {
    const requestContext = requestContextStorage.getStore();
    if (!requestContext) {
        throw new Error("getRequestContext() must be called while rendering a request that entry.rsc.tsx wraps with runWithRequestContext()");
    }
    return requestContext;
}
