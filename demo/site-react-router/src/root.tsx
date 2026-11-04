import "@dextinity/site-react/css";
import "@fontsource-variable/inter";
import "@src/styles/global.scss";

import { requestContextMiddleware } from "@dextinity/site-react-router/server";
import { defaultTitle } from "@src/layout/defaultTitle";
import { Outlet } from "react-router";

import type { Route } from "./+types/root";

export { ErrorBoundary, Layout } from "./RootDocument";

// Server components read the context of the request with getRequestContext()
export const middleware: Route.MiddlewareFunction[] = [requestContextMiddleware];

export const links: Route.LinksFunction = () => [
    { rel: "icon", href: "/favicon.ico", sizes: "any" },
    { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", href: "/apple-icon.png" },
];

// For pages without an own title, routes with a `meta` export replace it
export const meta: Route.MetaFunction = ({ error }) => [{ title: error ? "Something went wrong" : defaultTitle }];

export function ServerComponent() {
    return <Outlet />;
}
