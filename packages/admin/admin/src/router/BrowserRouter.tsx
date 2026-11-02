import { type PropsWithChildren, useState } from "react";
import { createBrowserRouter } from "react-router";

import { catchAllRoutes, RouterProviderWithChildren } from "./RouterChildren";

interface RouterBrowserRouterProps {
    basename?: string;
}

// Router that sets up a material-ui confirmation dialog plus a PromptHandler that works with our Prompt (supporting multiple Prompts)
export const RouterBrowserRouter = ({ children, basename }: PropsWithChildren<RouterBrowserRouterProps>) => {
    const [router] = useState(() => createBrowserRouter(catchAllRoutes, { basename }));
    return <RouterProviderWithChildren router={router}>{children}</RouterProviderWithChildren>;
};
