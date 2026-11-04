import "@dextinity/site-react-router/css";

import { ImageConfigProvider } from "@dextinity/site-react-router";
import { Outlet } from "react-router";

import type { Route } from "./+types/root";
import { testContextMiddleware } from "./requestContext";

export { ErrorBoundary, Layout } from "./RootDocument";

export const middleware: Route.MiddlewareFunction[] = [testContextMiddleware];

export const links: Route.LinksFunction = () => [{ rel: "icon", href: "data:," }];

export function ServerComponent() {
    return (
        <ImageConfigProvider config={{ deviceSizes: [640, 1200], imageSizes: [64, 320] }}>
            <Outlet />
        </ImageConfigProvider>
    );
}
