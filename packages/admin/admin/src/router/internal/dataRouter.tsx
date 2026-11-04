import { createContext, type ReactNode, useContext, useLayoutEffect, useRef, useState } from "react";
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

export function useDataRouter(createRouter: () => DataRouter): DataRouter | undefined {
    const [router, setRouter] = useState<DataRouter>();
    const createRouterRef = useRef(createRouter);

    // Created in an effect instead of during render: StrictMode renders twice but only keeps one state, and the router created by the
    // discarded render would never be disposed. A layout effect renders the router before the first paint.
    useLayoutEffect(() => {
        const createdRouter = createRouterRef.current();
        setRouter(createdRouter);
        return () => {
            createdRouter.dispose();
        };
    }, []);

    return router;
}
