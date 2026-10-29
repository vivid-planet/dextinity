import { createHash } from "node:crypto";

import type { CachedResponse, FetchCacheStore } from "./fetchCacheStore.js";

type Fetch = typeof fetch;

function createCacheKey(request: Request, body: string) {
    const headers = [...request.headers.entries()].sort(([a], [b]) => a.localeCompare(b));
    return createHash("sha256")
        .update(JSON.stringify([request.method, request.url, headers, body]))
        .digest("hex");
}

const nullBodyStatuses = [204, 205, 304];

// Binary responses would be changed by storing them as text, so they aren't cached
function hasTextBody(response: Response) {
    if (nullBodyStatuses.includes(response.status)) {
        return true;
    }
    const contentType = response.headers.get("content-type") ?? "";
    return /^(text\/|application\/([\w.-]+\+)?(json|xml)\b)/.test(contentType);
}

function isCacheable(response: Response, body: string) {
    if (!response.ok) {
        return false;
    }
    if (response.headers.get("content-type")?.includes("application/json")) {
        try {
            // Must not cache GraphQL errors
            return !(JSON.parse(body) as { errors?: unknown }).errors;
        } catch {
            return false;
        }
    }
    return true;
}

/**
 * Creates a fetch that caches successful text responses, e.g. of a GraphQL API, in `store` for `revalidateInSeconds`.
 * Stale responses are served while they are refreshed in the background (stale-while-revalidate). Other responses, e.g. images,
 * are passed through without caching.
 */
export function createCachingFetch(baseFetch: Fetch, { revalidateInSeconds, store }: { revalidateInSeconds: number; store: FetchCacheStore }): Fetch {
    const inFlightRequests = new Map<string, Promise<CachedResponse | Response>>();

    function fetchAndCache(key: string, request: Request, body: string): Promise<CachedResponse | Response> {
        let inFlightRequest = inFlightRequests.get(key);
        if (!inFlightRequest) {
            inFlightRequest = (async () => {
                const response = await baseFetch(request.url, { method: request.method, headers: request.headers, body: body || undefined });
                if (!hasTextBody(response)) {
                    return response;
                }
                const cachedResponse: CachedResponse = {
                    status: response.status,
                    // The body has already been decoded
                    headers: Object.fromEntries(
                        [...response.headers.entries()].filter(([name]) => !["content-encoding", "content-length"].includes(name)),
                    ),
                    body: await response.text(),
                };
                if (isCacheable(response, cachedResponse.body)) {
                    await store.set(key, { lastModified: Date.now(), value: cachedResponse });
                } else {
                    console.error("FetchCache: not caching failed response", request.url, cachedResponse.status, cachedResponse.body);
                }
                return cachedResponse;
            })().finally(() => {
                inFlightRequests.delete(key);
            });
            inFlightRequests.set(key, inFlightRequest);
        }
        return inFlightRequest;
    }

    return async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const request = new Request(input, init);
        const body = await request.text();
        const key = createCacheKey(request, body);

        const cacheEntry = await store.get(key);
        let cachedResponse: CachedResponse | Response;
        if (cacheEntry) {
            if (Date.now() - cacheEntry.lastModified > revalidateInSeconds * 1000) {
                fetchAndCache(key, request, body).catch((error) => {
                    console.error("FetchCache: background revalidation failed", request.url, error);
                });
            }
            cachedResponse = cacheEntry.value;
        } else {
            cachedResponse = await fetchAndCache(key, request, body);
        }

        if (cachedResponse instanceof Response) {
            // Concurrent identical requests share the response
            return cachedResponse.clone();
        }
        const responseBody = nullBodyStatuses.includes(cachedResponse.status) ? null : cachedResponse.body;
        return new Response(responseBody, { status: cachedResponse.status, headers: cachedResponse.headers });
    };
}
