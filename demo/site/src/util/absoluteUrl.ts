import { getSiteContext } from "@src/framework/requestContext";

import { getSiteConfigForDomain } from "./siteConfig";

/**
 * Resolves the URL against the URL of the current site, e.g. for metadata that requires absolute URLs like `og:image`.
 * Absolute URLs are returned unchanged.
 */
export function absoluteUrl(url: string) {
    return new URL(url, getSiteConfigForDomain(getSiteContext().domain).url).href;
}
