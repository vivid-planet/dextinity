import { SitePreviewProvider } from "@dextinity/site-react-router";
import { contentSecurityPolicyHeadersMiddleware } from "@src/middleware/contentSecurityPolicyHeaders";
import { pageCacheControlMiddleware } from "@src/middleware/pageCacheControl";
import { predefinedPagesMiddleware } from "@src/middleware/predefinedPages";
import { siteContextMiddleware } from "@src/middleware/siteContext";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import { getSiteContext } from "@src/util/siteContext";
import { Outlet } from "react-router";

import type { Route } from "./+types/SiteLayout";

// The site context is available from predefinedPagesMiddleware on, in all routes of the site
export const middleware: Route.MiddlewareFunction[] = [
    contentSecurityPolicyHeadersMiddleware,
    siteContextMiddleware,
    predefinedPagesMiddleware,
    pageCacheControlMiddleware,
];

/**
 * The layout of the pages of a site, the counterpart of `[visibility]/[domain]/layout.tsx` of the Next.js site
 */
export function ServerComponent() {
    const { siteConfig, sitePreview } = getSiteContext();

    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            {sitePreview ? (
                <SitePreviewProvider>
                    <Outlet />
                </SitePreviewProvider>
            ) : (
                <Outlet />
            )}
        </SiteConfigProvider>
    );
}
