// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCachingFetch } from "./createCachingFetch";
import { createMemoryFetchCacheStore } from "./fetchCacheStore";

function jsonResponse(body: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(body), { ...init, headers: { "Content-Type": "application/json" } });
}

const graphQLInit = { method: "POST", body: JSON.stringify({ query: "{ a }", variables: {} }) };

describe("createCachingFetch", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("caches GraphQL queries", async () => {
        const baseFetch = vi.fn(async () => jsonResponse({ data: { a: 1 } }));
        const cachingFetch = createCachingFetch(baseFetch, { store: createMemoryFetchCacheStore(), revalidateInSeconds: 60 });

        await cachingFetch("http://api/graphql", graphQLInit);
        const response = await cachingFetch("http://api/graphql", graphQLInit);

        expect(baseFetch).toHaveBeenCalledTimes(1);
        expect(await response.json()).toEqual({ data: { a: 1 } });
    });

    it("distinguishes requests by their headers", async () => {
        const baseFetch = vi.fn(async () => jsonResponse({ data: {} }));
        const cachingFetch = createCachingFetch(baseFetch, { store: createMemoryFetchCacheStore(), revalidateInSeconds: 60 });

        await cachingFetch("http://api/graphql", graphQLInit);
        await cachingFetch("http://api/graphql", { ...graphQLInit, headers: { "x-include-invisible-content": "Pages:Unpublished" } });

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("doesn't cache no-store requests, errors and GraphQL errors", async () => {
        const baseFetch = vi
            .fn<typeof fetch>()
            .mockImplementation(async () => jsonResponse({ data: {} }))
            .mockImplementationOnce(async () => jsonResponse({ errors: [{ message: "failed" }] }))
            .mockImplementationOnce(async () => jsonResponse({}, { status: 500 }));
        const cachingFetch = createCachingFetch(baseFetch, { store: createMemoryFetchCacheStore(), revalidateInSeconds: 60 });

        await cachingFetch("http://api/graphql", graphQLInit);
        await cachingFetch("http://api/graphql", graphQLInit);
        await cachingFetch("http://api/graphql", { ...graphQLInit, cache: "no-store" });
        await cachingFetch("http://api/graphql", graphQLInit);
        await cachingFetch("http://api/graphql", graphQLInit);

        expect(baseFetch).toHaveBeenCalledTimes(4);
    });

    it("doesn't cache mutations of other APIs", async () => {
        const baseFetch = vi.fn(async () => jsonResponse({}));
        const cachingFetch = createCachingFetch(baseFetch, { store: createMemoryFetchCacheStore(), revalidateInSeconds: 60 });

        await cachingFetch("http://api/upload", { method: "POST", body: "{}" });
        await cachingFetch("http://api/upload", { method: "POST", body: "{}" });

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("merges identical requests running at the same time", async () => {
        const baseFetch = vi.fn(async () => jsonResponse({ data: { a: 1 } }));
        const cachingFetch = createCachingFetch(baseFetch, { store: createMemoryFetchCacheStore(), revalidateInSeconds: 60 });

        const responses = await Promise.all([cachingFetch("http://api/graphql", graphQLInit), cachingFetch("http://api/graphql", graphQLInit)]);

        expect(baseFetch).toHaveBeenCalledTimes(1);
        expect(await Promise.all(responses.map((response) => response.json()))).toEqual([{ data: { a: 1 } }, { data: { a: 1 } }]);
    });

    it("returns a stale response while refreshing it in the background", async () => {
        const baseFetch = vi
            .fn<typeof fetch>()
            .mockImplementationOnce(async () => jsonResponse({ data: { version: 1 } }))
            .mockImplementationOnce(async () => jsonResponse({ data: { version: 2 } }));
        const cachingFetch = createCachingFetch(baseFetch, { store: createMemoryFetchCacheStore(), revalidateInSeconds: 60 });

        await cachingFetch("http://api/graphql", graphQLInit);
        vi.setSystemTime(Date.now() + 61 * 1000);
        const staleResponse = await cachingFetch("http://api/graphql", graphQLInit);
        await new Promise((resolve) => setTimeout(resolve, 10));
        const refreshedResponse = await cachingFetch("http://api/graphql", graphQLInit);

        expect(await staleResponse.json()).toEqual({ data: { version: 1 } });
        expect(await refreshedResponse.json()).toEqual({ data: { version: 2 } });
        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("falls back to fetching when the store fails", async () => {
        const baseFetch = vi.fn(async () => jsonResponse({ data: {} }));
        const onError = vi.fn();
        const store = { get: vi.fn().mockRejectedValue(new Error("down")), set: vi.fn().mockRejectedValue(new Error("down")) };
        const cachingFetch = createCachingFetch(baseFetch, { store, revalidateInSeconds: 60, onError });

        const response = await cachingFetch("http://api/graphql", graphQLInit);

        expect(response.status).toBe(200);
        expect(onError).toHaveBeenCalledTimes(2);
    });
});
