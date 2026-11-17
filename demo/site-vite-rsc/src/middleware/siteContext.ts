import { getPreviewScope } from "@dextinity/site-vite-rsc/server";
import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { setSiteContext } from "@src/util/siteContext";
import { createMiddleware } from "hono/factory";

/**
 * Resolves the site once per request, in the preview by the scope set by `sitePreviewMiddleware`. Leaves the site context unset
 * for unknown hosts, they are handled by `redirectToMainHostMiddleware`.
 */
export const siteContextMiddleware = createMiddleware(async (c, next) => {
    const siteConfig = getSiteConfigForHost(getHostByHeaders(c.req.raw.headers), getPreviewScope());
    if (siteConfig) {
        setSiteContext({ domain: siteConfig.scope.domain });
    }

    await next();
});
