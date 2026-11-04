import type { PropsWithChildren } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, useRouteError } from "react-router";

export function Layout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                {/* The test app has no favicon, the browser would request it */}
                <link rel="icon" href="data:," />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function ErrorBoundary() {
    const error = useRouteError();
    return <p>{isRouteErrorResponse(error) ? `Error page ${error.status}` : "Error page 500"}</p>;
}
