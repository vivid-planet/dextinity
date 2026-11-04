import "@dextinity/site-react/css";
import "@fontsource-variable/inter";
import "@src/styles/global.scss";

import { CookieApiProvider, useLocalStorageCookieApi, useOneTrustCookieApi as useProductionCookieApi } from "@dextinity/site-react";
import { ImageConfigProvider } from "@dextinity/site-react-router";
import dextinityConfig from "@src/dextinity-config.json" with { type: "json" };
import { defaultTitle } from "@src/layout/defaultTitle";
import { NavigationProgress } from "@src/layout/NavigationProgress";
import { ErrorPage } from "@src/routes/ErrorPage";
import animateBoxInOnScrollStyles from "@src/util/animations/AnimateBoxInOnScroll.module.scss";
import { ErrorHandler } from "@src/util/ErrorHandler";
import type { PropsWithChildren } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from "react-router";

import type { Route } from "./+types/root";
import type { loader as languageLayoutLoader } from "./routes/LanguageLayout";

export const links: Route.LinksFunction = () => [
    { rel: "icon", href: "/favicon.ico", sizes: "any" },
    { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", href: "/apple-icon.png" },
];

// For pages without an own title, routes with a `meta` export replace it
export const meta: Route.MetaFunction = ({ error }) => [{ title: error ? "Something went wrong" : defaultTitle }];

/**
 * The document of all pages, also of the error pages
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
                <NavigationProgress />
                <CookieApiProvider api={process.env.NODE_ENV === "development" ? useLocalStorageCookieApi : useProductionCookieApi}>
                    <ImageConfigProvider config={dextinityConfig.images}>
                        <ErrorHandler>{children}</ErrorHandler>
                    </ImageConfigProvider>
                </CookieApiProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

// Without the language layout, its data may be what failed to load
export function ErrorBoundary() {
    return <ErrorPage />;
}
