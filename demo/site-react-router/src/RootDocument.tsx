"use client";

import animateBoxInOnScrollStyles from "@src/util/animations/AnimateBoxInOnScroll.module.scss";
import type { PropsWithChildren } from "react";
import { isRouteErrorResponse, Links, Meta, ScrollRestoration, useRouteError, useRouteLoaderData } from "react-router";

import type { loader as languageLayoutLoader } from "./routes/LanguageLayout";

/**
 * The HTML document of all pages, also of the error pages
 */
export function Layout({ children }: PropsWithChildren) {
    const languageLayoutData = useRouteLoaderData<typeof languageLayoutLoader>("language");

    return (
        <html lang={languageLayoutData?.scope.language ?? "en"}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
                <noscript>
                    <style>{`.${animateBoxInOnScrollStyles.scrollContainer} { opacity: 1; transform: none; transition: none; }`}</style>
                </noscript>
            </head>
            <body>
                {children}
                <ScrollRestoration />
            </body>
        </html>
    );
}

/**
 * For errors outside of the pages of a language, e.g. of the site layout or a block preview
 */
export function ErrorBoundary() {
    const error = useRouteError();
    const isNotFound = isRouteErrorResponse(error) && error.status === 404;

    return (
        <main>
            <p>{isNotFound ? "Page not found." : "Something went wrong."}</p>
            {/* A link that loads the whole document again, in case the error is caused by the client */}
            <a href="/">Return Home</a>
        </main>
    );
}
