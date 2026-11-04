import type { CachedResponse, FetchCacheStore } from "./fetchCacheStore.js";
import { createRequestKey } from "./requestKey.js";
import { isJsonContentType, isSuccessfulResponse, nullBodyStatuses } from "./successfulResponse.js";

type Fetch = typeof fetch;

// Binary responses would be changed by storing them as text, so they aren't cached
function hasTextBody(response: Response) {
    if (nullBodyStatuses.includes(response.status)) {
        return true;
    }
    const contentType = response.headers.get("content-type") ?? "";
    return /^(text\/|application\/([\w.-]+\+)?xml\b)/i.test(contentType) || isJsonContentType(contentType);
}

/**
 * Creates a fetch that caches successful text responses, e.g. of a GraphQL API, in `store` for `revalidateInSeconds`.
 * Stale responses are served while they are refreshed in the background (stale-while-revalidate). Other responses, e.g. images,
 * are passed through without caching.
 */
export function createCachingFetch(baseFetch: Fetch, { revalidateInSeconds, store }: { revalidateInSeconds: number; store: FetchCacheStore }): Fetch {
    const inFlightRequests = new Map<string, Promise<CachedResponse | Response>>();

    function fetchAndCache({
        key,
        request,
        body,
    }: {
        key: string;
        request: Request;
        body: Uint8Array<ArrayBuffer>;
    }): Promise<CachedResponse | Response> {
        let inFlightRequest = inFlightRequests.get(key);
        if (!inFlightRequest) {
            inFlightRequest = (async () => {
                const response = await baseFetch(request.url, {
                    method: request.method,
                    headers: request.headers,
                    body: body.byteLength ? body : undefined,
                });
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
                if (isSuccessfulResponse({ status: response.status, contentType: response.headers.get("content-type"), body: cachedResponse.body })) {
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
        // As bytes, so that binary request bodies are sent unchanged
        const body = new Uint8Array(await request.arrayBuffer());
        const key = createRequestKey(request, body);

        const cacheEntry = await store.get(key);
        let cachedResponse: CachedResponse | Response;
        if (cacheEntry) {
            if (Date.now() - cacheEntry.lastModified > revalidateInSeconds * 1000) {
                fetchAndCache({ key, request, body }).catch((error) => {
                    console.error("FetchCache: background revalidation failed", request.url, error);
                });
            }
            cachedResponse = cacheEntry.value;
        } else {
            cachedResponse = await fetchAndCache({ key, request, body });
        }

        if (cachedResponse instanceof Response) {
            // Concurrent identical requests share the response
            return cachedResponse.clone();
        }
        const responseBody = nullBodyStatuses.includes(cachedResponse.status) ? null : cachedResponse.body;
        return new Response(responseBody, { status: cachedResponse.status, headers: cachedResponse.headers });
    };
}
