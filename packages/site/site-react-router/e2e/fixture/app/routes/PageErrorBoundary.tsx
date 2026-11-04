"use client";
import { isRouteErrorResponse, useRouteError } from "react-router";

export function PageErrorBoundary() {
    const error = useRouteError();
    return <p id="page-error">Page error {isRouteErrorResponse(error) ? error.status : 500}</p>;
}
