import type { PropsWithChildren } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { createRouterRoutes, RouterChildrenProvider, useDataRouter } from "./internal/dataRouter";

export interface RouterBrowserRouterProps {
    /**
     * Only read when the router is created.
     */
    basename?: string;
}

/**
 * A data router using the browser history. Includes the `RouterPromptHandler`, which shows the confirmation dialog for `RouterPrompt`s.
 */
export const RouterBrowserRouter = ({ basename, children }: PropsWithChildren<RouterBrowserRouterProps>) => {
    const router = useDataRouter(() => createBrowserRouter(createRouterRoutes(), { basename }));

    return (
        <RouterChildrenProvider value={children}>
            <RouterProvider router={router} />
        </RouterChildrenProvider>
    );
};
