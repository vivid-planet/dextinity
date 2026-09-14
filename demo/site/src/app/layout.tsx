import "@dextinity/site-nextjs/css";
import "@src/styles/global.scss";

import { CookieApiProvider, useLocalStorageCookieApi, useOneTrustCookieApi as useProductionCookieApi } from "@dextinity/site-nextjs";
import { ErrorHandler } from "@src/util/ErrorHandler";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Dextinity Demo Site",
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
    return (
        <html>
            <body className={inter.className}>
                <CookieApiProvider api={process.env.NODE_ENV === "development" ? useLocalStorageCookieApi : useProductionCookieApi}>
                    <ErrorHandler>{children}</ErrorHandler>
                </CookieApiProvider>
            </body>
        </html>
    );
}
