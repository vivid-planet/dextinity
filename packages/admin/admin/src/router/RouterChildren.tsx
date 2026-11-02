import { type ContextType, createContext, type PropsWithChildren, type ReactNode, useContext } from "react";
import { type DataRouter, type RouteObject, UNSAFE_LocationContext as LocationContext, UNSAFE_RouteContext as RouteContext } from "react-router";
import { RouterProvider } from "react-router/dom";

import { RouterPromptHandler } from "./PromptHandler";

const RouterChildrenContext = createContext<ReactNode>(null);

function RouterChildren() {
    const children = useContext(RouterChildrenContext);
    return <RouterPromptHandler>{children}</RouterPromptHandler>;
}

// A data router is required for blocking navigations (used by RouterPrompt). All routes are rendered as descendant routes of a single catch-all route.
export const catchAllRoutes: RouteObject[] = [{ path: "*", element: <RouterChildren /> }];

const emptyRouteContext: ContextType<typeof RouteContext> = { outlet: null, matches: [], isDataRoute: false };
// React Router checks for a parent router by checking if the LocationContext is set
const emptyLocationContext = null as unknown as ContextType<typeof LocationContext>;

// The router instance is created once, so the children are passed through a context to allow them to change
export function RouterProviderWithChildren({ router, children }: PropsWithChildren<{ router: DataRouter }>) {
    return (
        <RouterChildrenContext.Provider value={children}>
            {/* Reset the context of a parent router, React Router doesn't support nested routers otherwise (e.g. a RouterMemoryRouter in a dialog) */}
            <LocationContext.Provider value={emptyLocationContext}>
                <RouteContext.Provider value={emptyRouteContext}>
                    <RouterProvider router={router} />
                </RouteContext.Provider>
            </LocationContext.Provider>
        </RouterChildrenContext.Provider>
    );
}
