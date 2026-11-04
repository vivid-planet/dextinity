import { isRouteErrorResponse, Outlet } from "react-router";

import type { Route } from "./+types/PageErrorBoundary";

export default function PageErrorBoundary() {
    return <Outlet />;
}

// Below the preview layout, so that the error pages are rendered in it
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    return <p>Page error {isRouteErrorResponse(error) ? error.status : 500}</p>;
}
