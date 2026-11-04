import { SitePreviewProvider } from "@dextinity/site-react-router";
import { sitePreviewMiddleware } from "@dextinity/site-react-router/server";
import { predefinedPagesMiddleware } from "@src/middleware/predefinedPages";
import { previewDomainMiddleware } from "@src/middleware/preview";
import { redirectToMainHostMiddleware } from "@src/middleware/redirectToMainHost";
import { siteContextMiddleware } from "@src/middleware/siteContext";
import { getSiteContext } from "@src/util/siteContext";
import { Outlet } from "react-router";

import type { Route } from "./+types/SiteLayout";

// The site context is available from `predefinedPagesMiddleware` on and in all loaders below this layout
export const middleware: Route.MiddlewareFunction[] = [
    sitePreviewMiddleware,
    siteContextMiddleware,
    previewDomainMiddleware,
    redirectToMainHostMiddleware,
    predefinedPagesMiddleware,
];

export function loader({ context }: Route.LoaderArgs) {
    return { isSitePreview: getSiteContext(context).sitePreview !== undefined };
}

export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
    return loaderData.isSitePreview ? (
        <SitePreviewProvider>
            <Outlet />
        </SitePreviewProvider>
    ) : (
        <Outlet />
    );
}
