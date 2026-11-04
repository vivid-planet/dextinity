import { createHash } from "node:crypto";

import type { CachedResponse, FetchCacheEntry, FetchCacheStore } from "./fetchCacheStore";

type Fetch = typeof fetch;

const uncachedRequestCaches: Array<RequestCache | undefined> = ["no-store", "no-cache", "reload", "only-if-cached"];

function getCacheKey(input: RequestInfo | URL, init: RequestInit | undefined): string | undefined {
    if (input instanceof Request) {
        // The body of a Request can only be read once, these requests aren't cached
        return undefined;
    }
    if (uncachedRequestCaches.includes(init?.cache)) {
        return undefined;
    }
    const method = (init?.method ?? "GET").toUpperCase();
    if (init?.body !== undefined && init.body !== null && typeof init.body !== "string") {
        return undefined;
    }
    if (method !== "GET" && method !== "HEAD" && !isGraphQLBody(init?.body)) {
        return undefined;
    }
    const headers = [...new Headers(init?.headers).entries()].sort(([a], [b]) => a.localeCompare(b));
    return createHash("sha256")
        .update(JSON.stringify([method, input.toString(), headers, init?.body ?? null]))
        .digest("hex");
}

function isGraphQLBody(body: BodyInit | null | undefined): boolean {
    if (typeof body !== "string" || !body.startsWith("{")) {
        return false;
    }
    try {
        const json = JSON.parse(body);
        return typeof json.query === "string" || json.extensions?.persistedQuery !== undefined;
    } catch {
        return false;
    }
}

function isTextResponse(response: Response): boolean {
    const contentType = response.headers.get("Content-Type") ?? "";
    return /^(text\/|application\/(.+\+)?(json|xml|graphql-response\+json))/.test(contentType);
}

function hasGraphQLErrors(response: CachedResponse): boolean {
    if (!response.body.startsWith("{")) {
        return false;
    }
    try {
        return Array.isArray(JSON.parse(response.body).errors);
    } catch {
        return false;
    }
}

function toResponse({ body, status, statusText, headers }: CachedResponse): Response {
    return new Response(status === 204 || status === 304 ? null : body, { status, statusText, headers });
}

/**
 * A `fetch` that caches the responses like the data cache of Next.js does with `cache: "force-cache"` and `next.revalidate`:
 *
 * - GET requests and GraphQL queries are cached, unless they set `cache: "no-store"` (or another uncached `cache` option)
 * - A cached response older than `revalidateInSeconds` is still returned, while it's refreshed in the background (stale-while-revalidate)
 * - Identical requests running at the same time share one request
 * - Error responses, GraphQL responses with `errors` and non-text responses aren't cached
 *
 * @example
 * const cachingFetch = createCachingFetch(fetch, { store: createMemoryFetchCacheStore(), revalidateInSeconds: 7.5 * 60 });
 */
export function createCachingFetch(
    baseFetch: Fetch,
    {
        store,
        revalidateInSeconds,
        onError = console.error,
    }: { store: FetchCacheStore; revalidateInSeconds: number; onError?: (error: unknown) => void },
): Fetch {
    const pendingRequests = new Map<string, Promise<CachedResponse | Response>>();

    async function fetchAndStore(key: string, input: RequestInfo | URL, init: RequestInit | undefined): Promise<CachedResponse | Response> {
        const response = await baseFetch(input, init);
        if (!response.ok || !isTextResponse(response)) {
            return response;
        }
        const headers = [...response.headers.entries()].filter(([name]) => name !== "content-encoding" && name !== "content-length");
        const cachedResponse: CachedResponse = { status: response.status, statusText: response.statusText, headers, body: await response.text() };
        if (!hasGraphQLErrors(cachedResponse)) {
            try {
                await store.set(key, { response: cachedResponse, createdAt: Date.now() });
            } catch (error) {
                onError(error);
            }
        }
        return cachedResponse;
    }

    function fetchOnce(key: string, input: RequestInfo | URL, init: RequestInit | undefined): Promise<CachedResponse | Response> {
        let pendingRequest = pendingRequests.get(key);
        if (!pendingRequest) {
            pendingRequest = fetchAndStore(key, input, init).finally(() => pendingRequests.delete(key));
            pendingRequests.set(key, pendingRequest);
        }
        return pendingRequest;
    }

    return async function cachingFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const key = getCacheKey(input, init);
        if (!key) {
            return baseFetch(input, init);
        }

        let entry: FetchCacheEntry | undefined;
        try {
            entry = await store.get(key);
        } catch (error) {
            onError(error);
        }

        if (entry) {
            if (Date.now() - entry.createdAt > revalidateInSeconds * 1000) {
                // A request for revalidation must not be aborted by the request that triggered it
                fetchOnce(key, input, { ...init, signal: undefined }).catch(onError);
            }
            return toResponse(entry.response);
        }

        const response = await fetchOnce(key, input, init);
        // A Response can't be shared between the merged requests, only cached responses can
        return response instanceof Response ? response.clone() : toResponse(response);
    };
}
