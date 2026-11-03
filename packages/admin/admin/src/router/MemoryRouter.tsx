import type { PropsWithChildren } from "react";
import { createMemoryRouter, type InitialEntry } from "react-router";
import { RouterProvider } from "react-router/dom";

import { createRouterRoutes, RouterChildrenProvider, useDataRouter } from "./internal/dataRouter";
import { RouterContextIsolation } from "./internal/routeContext";

export interface RouterMemoryRouterProps {
    /**
     * Only read when the router is created.
     */
    initialEntries?: InitialEntry[];
    /**
     * Only read when the router is created.
     */
    initialIndex?: number;
    /**
     * Only read when the router is created.
     */
    basename?: string;
}

/**
 * A data router keeping the history in memory. Includes the `RouterPromptHandler`, which shows the confirmation dialog for `RouterPrompt`s.
 * Can be rendered inside another router, e.g. in a dialog, to navigate independently of the outer router.
 */
export const RouterMemoryRouter = ({ initialEntries, initialIndex, basename, children }: PropsWithChildren<RouterMemoryRouterProps>) => {
    const router = useDataRouter(() => createMemoryRouter(createRouterRoutes(), { initialEntries, initialIndex, basename }));

    return (
        <RouterContextIsolation>
            <RouterChildrenProvider value={children}>
                <RouterProvider router={router} />
            </RouterChildrenProvider>
        </RouterContextIsolation>
    );
};
