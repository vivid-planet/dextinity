import { noStoreCacheControl } from "@dextinity/site-react-router/server";
import { getSiteContext } from "@src/util/siteContext";
import type { MiddlewareFunction } from "react-router";

// Like the Next.js site with pages revalidated every 7.5 minutes, the CDN serves stale pages while it revalidates them
const publicPageCacheControl = "s-maxage=450, stale-while-revalidate=31535550";

/**
 * Caches the pages in the CDN, but not the ones of the site preview. Resource routes set their own `Cache-Control`.
 * Errors aren't cached, see `preventCachingOfErrorResponse()` in entry.rsc.tsx.
 */
export const pageCacheControlMiddleware: MiddlewareFunction<Response> = async ({ request, context }, next) => {
    const response = await next();
    const { sitePreview, visibility } = getSiteContext(context);

    if (sitePreview || visibility !== "default") {
        response.headers.set("Cache-Control", noStoreCacheControl);
    } else if (
        request.method === "GET" &&
        response.status === 200 &&
        response.headers.get("Content-Type")?.startsWith("text/x-component") &&
        !response.headers.has("Cache-Control")
    ) {
        response.headers.set("Cache-Control", publicPageCacheControl);
    }

    return response;
};
