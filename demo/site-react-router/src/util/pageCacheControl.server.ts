import { noStoreCacheControl } from "@dextinity/site-react-router/server";
import { getSiteContext } from "@src/util/siteContext";
import type { RouterContextProvider } from "react-router";

// Same as Next.js for pages revalidated every 7.5 minutes
const publicCacheControl = "s-maxage=450, stale-while-revalidate=31535550";

/**
 * The headers of `data()` for the loaders of pages, used by `cacheControlHeaders`. Preview content must not be cached,
 * also from the block preview, which doesn't set `sitePreview`.
 */
export function getPageHeaders(context: Readonly<RouterContextProvider>) {
    const { visibility, sitePreview } = getSiteContext(context);
    return { headers: { "Cache-Control": sitePreview || visibility !== "default" ? noStoreCacheControl : publicCacheControl } };
}
