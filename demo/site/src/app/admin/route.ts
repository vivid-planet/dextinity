import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import type { Context, Next } from "hono";

/**
 * Redirects to the admin of the site, if the admin URL is configured
 */
export async function adminRoute(c: Context, next: Next) {
    if (!process.env.ADMIN_URL) {
        return next();
    }
    const host = getHostByHeaders(c.req.raw.headers);
    const siteConfig = await getSiteConfigForHost(host);
    if (siteConfig) {
        const { domain, languages } = siteConfig.scope;
        const language = languages[0];
        return c.redirect(new URL(`/${domain}/${language}`, process.env.ADMIN_URL).toString(), 307);
    }
    return c.redirect(new URL(process.env.ADMIN_URL).toString(), 307);
}
