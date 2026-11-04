import { AsyncLocalStorage } from "node:async_hooks";

import type { MiddlewareFunction, RouterContextProvider } from "react-router";

const requestContextStorage = new AsyncLocalStorage<Readonly<RouterContextProvider>>();

/**
 * Makes the context of the request available to server components with `getRequestContext()`, as React Router only passes it to
 * middlewares, loaders and actions. Register it as the first middleware of the root route, React Router renders the server
 * components inside the middlewares.
 */
export const requestContextMiddleware: MiddlewareFunction<Response> = ({ context }, next) => requestContextStorage.run(context, next);

/**
 * The context of the request in server components, e.g. for `getGraphQLFetch(getRequestContext())`. Loaders and middlewares use
 * their `context` argument instead.
 */
export function getRequestContext(): Readonly<RouterContextProvider> {
    const context = requestContextStorage.getStore();
    if (!context) {
        throw new Error("The request context is only available while rendering a request, register requestContextMiddleware in the root route");
    }
    return context;
}
