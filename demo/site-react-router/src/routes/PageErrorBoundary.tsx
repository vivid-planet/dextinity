"use client";

import { isRouteErrorResponse, Link, useRouteError, useRouteLoaderData } from "react-router";

import type { loader as languageLayoutLoader } from "./LanguageLayout";

export function PageErrorBoundary() {
    const error = useRouteError();
    const scope = useRouteLoaderData<typeof languageLayoutLoader>("language")?.scope ?? { domain: "main", language: "en" };

    if (isRouteErrorResponse(error) && error.status === 404) {
        return (
            <main id="mainContent">
                <p>Page not found (Scope {JSON.stringify(scope)}).</p>
                <Link to={`/${scope.language}`}>Return Home</Link>
            </main>
        );
    }

    return (
        <main id="mainContent">
            <p>Something went wrong.</p>
            {/* Loads the whole document again, in case the error is caused by the client */}
            <a href={`/${scope.language}`}>Return Home</a>
        </main>
    );
}
