import type { Context } from "hono";

/**
 * Serves the response from Cloudflare's cache of the data center (Cache API) or creates and caches it. Only responses with a public
 * `cache-control` are stored. Without the Cache API (outside of Workers), always creates the response.
 *
 * @param cacheKey A URL that identifies the response, including everything it varies by (e.g. the negotiated format)
 */
export async function withEdgeCache(c: Context, cacheKey: string, createResponse: () => Promise<Response>): Promise<Response> {
    const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
    if (!cache) {
        return createResponse();
    }

    const request = new Request(cacheKey);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await createResponse();
    if (response.ok) {
        c.executionCtx.waitUntil(cache.put(request, response.clone()));
    }
    return response;
}
