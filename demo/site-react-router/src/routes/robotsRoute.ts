import { robotsResponse } from "@dextinity/site-react-router/server";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/robotsRoute";

export function loader({ context }: Route.LoaderArgs) {
    const { siteConfig } = getSiteContext(context);
    return robotsResponse(
        { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteConfig.url}/sitemap.xml` },
        { headers: { "Cache-Control": "public, max-age=900" } },
    );
}
