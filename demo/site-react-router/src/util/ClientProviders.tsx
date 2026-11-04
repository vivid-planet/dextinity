"use client";

import { CookieApiProvider, useLocalStorageCookieApi, useOneTrustCookieApi as useProductionCookieApi } from "@dextinity/site-react-router";
import type { PropsWithChildren } from "react";

import { ErrorHandler } from "./ErrorHandler";

/**
 * The providers of the root layout that pass functions, which server components can't pass to client components
 */
export function ClientProviders({ children }: PropsWithChildren) {
    return (
        <CookieApiProvider api={process.env.NODE_ENV === "development" ? useLocalStorageCookieApi : useProductionCookieApi}>
            <ErrorHandler>{children}</ErrorHandler>
        </CookieApiProvider>
    );
}
