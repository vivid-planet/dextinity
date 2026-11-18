import { useRoutePattern } from "../../router/internal/routeContext";
import { ErrorBoundary, type ErrorBoundaryProps } from "./ErrorBoundary";

export type RouteWithErrorBoundaryProps = Omit<ErrorBoundaryProps, "key">;

/**
 * Wraps the element of a route in an `ErrorBoundary`, e.g. `<Route path="products/*" element={<RouteWithErrorBoundary><Products /></RouteWithErrorBoundary>} />`.
 * The error is reset when navigating to another route.
 */
const RouteWithErrorBoundary = (props: RouteWithErrorBoundaryProps) => {
    const routePattern = useRoutePattern();
    return <ErrorBoundary key={routePattern} {...props} />;
};
export { RouteWithErrorBoundary };
