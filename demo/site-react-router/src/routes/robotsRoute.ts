import { robotsResponse } from "@dextinity/site-react-router/server";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/robotsRoute";

export function loader({ context }: Route.LoaderArgs) {
    const siteConfig = getSiteConfigForDomain(getSiteContext(context).domain);

    return robotsResponse({
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    });
}
