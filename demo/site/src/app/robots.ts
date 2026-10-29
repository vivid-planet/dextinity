import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";
import type { Context } from "hono";

export function robotsRoute(c: Context) {
    const siteConfig = getSiteConfigForDomain(getSiteContext().domain);

    c.header("Cache-Control", "public, max-age=900");
    return c.text(`User-Agent: *\nAllow: /\n\nSitemap: ${siteConfig.url}/sitemap.xml\n`);
}
