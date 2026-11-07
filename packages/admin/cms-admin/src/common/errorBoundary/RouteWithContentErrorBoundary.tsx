import { Route, type RouteProps } from "react-router";

import { ContentErrorBoundary } from "./ContentErrorBoundary";

/** A `Route` whose content is wrapped in a `ContentErrorBoundary`, reset when the path changes. */
export function RouteWithContentErrorBoundary(props: RouteProps) {
    return (
        <ContentErrorBoundary key={JSON.stringify(props.path)}>
            <Route {...props} />
        </ContentErrorBoundary>
    );
}
