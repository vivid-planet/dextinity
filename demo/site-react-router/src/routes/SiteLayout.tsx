import { SitePreviewProvider } from "@dextinity/site-react-router";
import { sitePreviewMiddleware } from "@dextinity/site-react-router/server";
import { predefinedPagesMiddleware } from "@src/middleware/predefinedPages.server";
import { previewDomainMiddleware } from "@src/middleware/preview.server";
import { redirectToMainHostMiddleware } from "@src/middleware/redirectToMainHost.server";
import { siteContextMiddleware } from "@src/middleware/siteContext.server";
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

export default function SiteLayout({ loaderData }: Route.ComponentProps) {
    return loaderData.isSitePreview ? (
        <SitePreviewProvider>
            <Outlet />
        </SitePreviewProvider>
    ) : (
        <Outlet />
    );
}
