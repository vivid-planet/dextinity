"use client";

import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary() {
    const error = useRouteError();
    return <p>Page error {isRouteErrorResponse(error) ? error.status : 500}</p>;
}
