import { type PropsWithChildren, useState } from "react";
import { createMemoryRouter, type InitialEntry } from "react-router";

import { catchAllRoutes, RouterProviderWithChildren } from "./RouterChildren";

interface RouterMemoryRouterProps {
    basename?: string;
    initialEntries?: InitialEntry[];
    initialIndex?: number;
}

// Router that sets up a material-ui confirmation dialog plus a PromptHandler that works with our Prompt (supporting multiple Prompts)
export const RouterMemoryRouter = ({ children, basename, initialEntries, initialIndex }: PropsWithChildren<RouterMemoryRouterProps>) => {
    const [router] = useState(() => createMemoryRouter(catchAllRoutes, { basename, initialEntries, initialIndex }));
    return <RouterProviderWithChildren router={router}>{children}</RouterProviderWithChildren>;
};
