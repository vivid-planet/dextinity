import { requestContextMiddleware } from "@dextinity/site-react-router/server";
import { Outlet } from "react-router";

import type { Route } from "./+types/root";

export { ErrorBoundary, Layout } from "./RootDocument";

export const middleware: Route.MiddlewareFunction[] = [requestContextMiddleware];

export function ServerComponent() {
    return <Outlet />;
}
