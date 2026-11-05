import { isRouteErrorResponse, Outlet } from "react-router";

import type { Route } from "./+types/PageErrorLayout";

export { PageErrorBoundary as ErrorBoundary } from "./PageErrorBoundary";

export const meta: Route.MetaFunction = ({ error }) => {
    if (!error) {
        // React Router uses the meta of the deepest route that exports one, pages without a title get the default title
        return [{ title: "Dextinity Demo Site" }];
    }
    return [{ title: isRouteErrorResponse(error) && error.status === 404 ? "Page not found" : "Something went wrong" }];
};

/**
 * Renders the not found and error pages of the pages between the header and the footer of the language layout,
 * the counterpart of `[language]/not-found.tsx` of the Next.js site
 */
export function ServerComponent() {
    return <Outlet />;
}
