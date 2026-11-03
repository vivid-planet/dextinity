import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { type DataRouter, type RouteObject, useRouteError } from "react-router";

import { PromptContext } from "../Prompt";
import { RouterPromptHandler } from "../PromptHandler";
import { ResetSubRoute } from "../SubRoute";

// Passed by context instead of being part of the route definition, so that re-rendered children reach the router.
const RouterChildrenContext = createContext<ReactNode>(null);

export const RouterChildrenProvider = RouterChildrenContext.Provider;

function RouterRoot() {
    const children = useContext(RouterChildrenContext);
    return (
        <ResetSubRoute>
            <PromptContext.Provider value={undefined}>
                <RouterPromptHandler>{children}</RouterPromptHandler>
            </PromptContext.Provider>
        </ResetSubRoute>
    );
}

// Errors propagate to error boundaries outside of the router, instead of showing React Router's default error page
function RethrowRouteError(): never {
    throw useRouteError();
}

export function createRouterRoutes(): RouteObject[] {
    return [{ path: "*", element: <RouterRoot />, ErrorBoundary: RethrowRouteError }];
}

const disposedRouters = new WeakSet<DataRouter>();

export function useDataRouter(createRouter: () => DataRouter): DataRouter {
    const [router, setRouter] = useState(createRouter);
    const createRouterRef = useRef(createRouter);

    useEffect(() => {
        createRouterRef.current = createRouter;
    });

    useEffect(() => {
        if (disposedRouters.has(router)) {
            // StrictMode remounts after disposing the router in the cleanup
            setRouter(createRouterRef.current());
            return;
        }
        return () => {
            router.dispose();
            disposedRouters.add(router);
        };
    }, [router]);

    return router;
}
