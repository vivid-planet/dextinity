import { getSiteConfig } from "@src/util/siteConfig";
import type { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
    const siteConfig = await getSiteConfig();

    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
