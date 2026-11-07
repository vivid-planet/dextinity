import { Route, type RouteProps, useLocation } from "react-router";

import { ContentErrorBoundary } from "./ContentErrorBoundary";

/** A `Route` whose content is wrapped in a `ContentErrorBoundary`, reset when the route or the location changes. */
export function RouteWithContentErrorBoundary(props: RouteProps) {
    const location = useLocation();
    return (
        <ContentErrorBoundary key={JSON.stringify(props.path)} resetKey={location.pathname}>
            <Route {...props} />
        </ContentErrorBoundary>
    );
}
