export const noStoreCacheControl = "private, no-cache, no-store, max-age=0, must-revalidate";

/**
 * Whether a CDN may store a response with this `Cache-Control` and serve it to other visitors
 */
export function isSharedCacheable(cacheControl: string) {
    const directives = cacheControl.split(",").map((directive) => directive.trim().split("=")[0].toLowerCase());
    return !directives.includes("no-store") && !directives.includes("private");
}
