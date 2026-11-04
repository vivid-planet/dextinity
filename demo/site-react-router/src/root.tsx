import "@dextinity/site-react-router/css";
import "@fontsource-variable/inter";
import "@src/styles/global.scss";

import { ImageConfigProvider } from "@dextinity/site-react-router";
import dextinityConfig from "@src/dextinity-config.json";
import { ClientProviders } from "@src/util/ClientProviders";
import { isRouteErrorResponse, Outlet } from "react-router";

import type { Route } from "./+types/root";

export { ErrorBoundary, Layout } from "./RootDocument";

export const links: Route.LinksFunction = () => [
    { rel: "icon", href: "/favicon.ico", sizes: "any" },
    { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", href: "/apple-icon.png" },
];

// Pages without a title of their own get the default one
export const meta: Route.MetaFunction = ({ error }) => {
    if (!error) {
        return [{ title: "Dextinity Demo Site" }];
    }
    return [{ title: isRouteErrorResponse(error) && error.status === 404 ? "Page not found" : "Something went wrong" }];
};

export function ServerComponent() {
    return (
        <ImageConfigProvider config={dextinityConfig.images}>
            <ClientProviders>
                <Outlet />
            </ClientProviders>
        </ImageConfigProvider>
    );
}
