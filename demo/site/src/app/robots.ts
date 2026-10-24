import { getSiteConfig } from "@src/util/siteConfig";
import type { Context } from "hono";

export async function robotsRoute(c: Context) {
    const siteConfig = await getSiteConfig();

    return c.text(`User-Agent: *\nAllow: /\n\nSitemap: ${siteConfig.url}/sitemap.xml\n`);
}
