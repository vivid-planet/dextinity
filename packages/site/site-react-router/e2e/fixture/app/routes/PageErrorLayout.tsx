import { Outlet } from "react-router";

export { PageErrorBoundary as ErrorBoundary } from "./PageErrorBoundary";

/**
 * Renders the errors of the pages inside the page layout, an error boundary of the page layout would replace the layout
 */
export function ServerComponent() {
    return <Outlet />;
}
