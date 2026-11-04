import { sitemapResponse } from "@dextinity/site-react-router/server";
import { getGraphQLFetch } from "@src/util/graphQLClient.server";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/sitemapRoute";
import { loadSitemap } from "./sitemap.server";

export async function loader({ context }: Route.LoaderArgs) {
    const { domain, visibility } = getSiteContext(context);
    return sitemapResponse(await loadSitemap({ domain, graphQLFetch: getGraphQLFetch(context) }), { isPreview: visibility !== "default" });
}
