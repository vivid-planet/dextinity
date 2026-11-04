"use client";

import { CookieApiProvider, useLocalStorageCookieApi, useOneTrustCookieApi as useProductionCookieApi } from "@dextinity/site-react";
import { ImageConfigProvider } from "@dextinity/site-react-router";
import dextinityConfig from "@src/dextinity-config.json" with { type: "json" };
import { NavigationProgress } from "@src/layout/NavigationProgress";
import { ErrorPage } from "@src/routes/ErrorPage";
import animateBoxInOnScrollStyles from "@src/util/animations/AnimateBoxInOnScroll.module.scss";
import { ErrorHandler } from "@src/util/ErrorHandler";
import type { PropsWithChildren } from "react";
import { Links, Meta, ScrollRestoration, useRouteLoaderData } from "react-router";

/**
 * The document of all pages, also of the error pages. A client component, as it reads the language of the language layout.
 */
export function Layout({ children }: PropsWithChildren) {
    const languageLayoutData = useRouteLoaderData<{ scope: { language: string } }>("language");

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
                <NavigationProgress />
                <CookieApiProvider api={process.env.NODE_ENV === "development" ? useLocalStorageCookieApi : useProductionCookieApi}>
                    <ImageConfigProvider config={dextinityConfig.images}>
                        <ErrorHandler>{children}</ErrorHandler>
                    </ImageConfigProvider>
                </CookieApiProvider>
                <ScrollRestoration />
            </body>
        </html>
    );
}

// Without the language layout, its data may be what failed to load
export function ErrorBoundary() {
    return <ErrorPage />;
}
