import { robotsResponse } from "@dextinity/site-vite-rsc/server";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";

export function robotsRoute() {
    const siteConfig = getSiteConfigForDomain(getSiteContext().domain);

    return robotsResponse({
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    });
}
