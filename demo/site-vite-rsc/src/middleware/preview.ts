import { getHostByHeaders } from "@src/util/siteConfig";
import { hasSiteContext } from "@src/util/siteContext";
import { createMiddleware } from "hono/factory";

export const previewDomainMiddleware = createMiddleware(async (c, next) => {
    // Check if scope has been set via the site-preview api url
    if (getHostByHeaders(c.req.raw.headers) === process.env.PREVIEW_DOMAIN && !hasSiteContext()) {
        return c.json({ error: "Preview has to be called from within Dextinity Web preview" }, 404);
    }

    await next();
});
