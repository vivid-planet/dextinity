import { defaultTitle } from "@src/layout/defaultTitle";
import { isRouteErrorResponse, Outlet } from "react-router";

import type { Route } from "./+types/PageErrorBoundary";

export { ErrorBoundary } from "./PageErrorPage";

export const meta: Route.MetaFunction = ({ error }) => {
    if (!error) {
        // React Router uses the meta of the deepest route that has one, the pages without a title get the default one
        return [{ title: defaultTitle }];
    }
    return [{ title: isRouteErrorResponse(error) && error.status === 404 ? "Page not found" : "Something went wrong" }];
};

/**
 * Renders the not found and error pages inside the header and footer of the language layout
 */
export function ServerComponent() {
    return <Outlet />;
}
