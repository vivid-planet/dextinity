"use client";
import { type PropsWithChildren, useEffect } from "react";
import { isRouteErrorResponse, Links, Meta, ScrollRestoration, useRouteError } from "react-router";

export function Layout({ children }: PropsWithChildren) {
    useEffect(() => {
        // The tests wait for the hydration before they interact with the page
        document.documentElement.dataset.hydrated = "true";
    }, []);

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
            </body>
        </html>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    return <p id="root-error">Root error {isRouteErrorResponse(error) ? error.status : "unknown"}</p>;
}
