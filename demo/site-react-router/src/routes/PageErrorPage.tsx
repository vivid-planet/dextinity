"use client";

import type { ContentScope } from "@src/site-configs";
import { isRouteErrorResponse, useRouteError, useRouteLoaderData } from "react-router";

import { ErrorPage } from "./ErrorPage";
import { SiteNotFound } from "./SiteNotFound";

/**
 * The not found and error pages of the site, a client component as it reads the error and the scope of the language layout
 */
export function ErrorBoundary() {
    const error = useRouteError();
    const languageLayoutData = useRouteLoaderData<{ scope: ContentScope }>("language");
    if (isRouteErrorResponse(error) && error.status === 404 && languageLayoutData) {
        return <SiteNotFound scope={languageLayoutData.scope} />;
    }
    return <ErrorPage />;
}
