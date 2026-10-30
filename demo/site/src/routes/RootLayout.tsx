import "@dextinity/site-react/css";
import "@fontsource-variable/inter";
import "@src/styles/global.scss";

import { CookieApiProvider, useLocalStorageCookieApi, useOneTrustCookieApi as useProductionCookieApi } from "@dextinity/site-react";
import { ImageConfigProvider } from "@dextinity/site-vite-rsc";
import dextinityConfig from "@src/dextinity-config.json" with { type: "json" };
import { NavigationProgress } from "@src/layout/NavigationProgress";
import animateBoxInOnScrollStyles from "@src/util/animations/AnimateBoxInOnScroll.module.scss";
import { ErrorHandler } from "@src/util/ErrorHandler";
import type { PropsWithChildren } from "react";

export function RootLayout({ children, lang }: PropsWithChildren<{ lang?: string }>) {
    return (
        <html lang={lang}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-icon.png" />
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
            </body>
        </html>
    );
}
