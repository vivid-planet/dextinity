import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { createMiddleware } from "hono/factory";

export const previewDomainMiddleware = createMiddleware(async (c, next) => {
    // Check if scope has been set via the site-preview api url
    const host = getHostByHeaders(c.req.raw.headers);
    if (host === process.env.PREVIEW_DOMAIN) {
        const siteConfig = await getSiteConfigForHost(host);
        if (!siteConfig) {
            return c.json({ error: "Preview has to be called from within Dextinity Web preview" }, 404);
        }
    }

    await next();
});
