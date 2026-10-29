// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCachingFetch } from "./fetchCache.js";
import type { FetchCacheEntry, FetchCacheStore } from "./fetchCacheStore.js";

const cacheEntries = new Map<string, FetchCacheEntry>();

const store: FetchCacheStore = {
    get: async (key) => cacheEntries.get(key) ?? null,
    set: async (key, entry) => {
        cacheEntries.set(key, entry);
    },
};

const revalidateInSeconds = 60;

function createBaseFetch(createResponse: () => Response = () => Response.json({ data: { page: "content" } })) {
    return vi.fn<typeof fetch>(async () => createResponse());
}

describe("createCachingFetch", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        cacheEntries.clear();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("serves successful responses from the cache", async () => {
        const baseFetch = createBaseFetch();
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        const first = await cachingFetch("https://api.example.com/graphql", { method: "POST", body: "query" });
        const second = await cachingFetch("https://api.example.com/graphql", { method: "POST", body: "query" });

        expect(baseFetch).toHaveBeenCalledTimes(1);
        expect(await first.json()).toEqual({ data: { page: "content" } });
        expect(await second.json()).toEqual({ data: { page: "content" } });
        expect(second.status).toBe(200);
        expect(second.headers.get("content-type")).toContain("application/json");
    });

    it("distinguishes requests by method, URL, headers and body", async () => {
        const baseFetch = createBaseFetch();
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        await cachingFetch("https://api.example.com/graphql", { method: "POST", body: "a" });
        await cachingFetch("https://api.example.com/graphql", { method: "POST", body: "b" });
        await cachingFetch("https://api.example.com/graphql", { method: "POST", body: "a", headers: { "x-preview": "1" } });
        await cachingFetch("https://api.example.com/other", { method: "POST", body: "a" });
        await cachingFetch("https://api.example.com/graphql");

        expect(baseFetch).toHaveBeenCalledTimes(5);
    });

    it("doesn't cache failed responses", async () => {
        const baseFetch = createBaseFetch(() => new Response("Bad Gateway", { status: 502 }));
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        const response = await cachingFetch("https://api.example.com/graphql");
        await cachingFetch("https://api.example.com/graphql");

        expect(response.status).toBe(502);
        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("doesn't cache GraphQL errors", async () => {
        const baseFetch = createBaseFetch(() => Response.json({ errors: [{ message: "Failed" }] }));
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        await cachingFetch("https://api.example.com/graphql");
        await cachingFetch("https://api.example.com/graphql");

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("doesn't cache invalid JSON", async () => {
        const baseFetch = createBaseFetch(() => new Response("{", { headers: { "content-type": "application/json" } }));
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        await cachingFetch("https://api.example.com/graphql");
        await cachingFetch("https://api.example.com/graphql");

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("drops the content encoding and length, because the body is stored decoded", async () => {
        const baseFetch = createBaseFetch(
            () => new Response("content", { headers: { "content-encoding": "gzip", "content-length": "7", "x-custom": "kept" } }),
        );
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        const response = await cachingFetch("https://api.example.com/file");

        expect(response.headers.get("content-encoding")).toBeNull();
        expect(response.headers.get("x-custom")).toBe("kept");
        expect(await response.text()).toBe("content");
    });

    it("sends a single request for concurrent identical requests", async () => {
        const baseFetch = createBaseFetch();
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        const responses = await Promise.all([cachingFetch("https://api.example.com/graphql"), cachingFetch("https://api.example.com/graphql")]);

        expect(baseFetch).toHaveBeenCalledTimes(1);
        expect(await Promise.all(responses.map((response) => response.json()))).toEqual([
            { data: { page: "content" } },
            { data: { page: "content" } },
        ]);
    });

    it("serves stale responses while revalidating them in the background", async () => {
        let version = 1;
        const baseFetch = createBaseFetch(() => Response.json({ version }));
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        await cachingFetch("https://api.example.com/graphql");
        version = 2;

        vi.advanceTimersByTime((revalidateInSeconds - 1) * 1000);
        expect(await (await cachingFetch("https://api.example.com/graphql")).json()).toEqual({ version: 1 });
        expect(baseFetch).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(2000);
        expect(await (await cachingFetch("https://api.example.com/graphql")).json()).toEqual({ version: 1 });
        expect(baseFetch).toHaveBeenCalledTimes(2);

        await vi.waitFor(async () => {
            expect(await (await cachingFetch("https://api.example.com/graphql")).json()).toEqual({ version: 2 });
        });
    });

    it("keeps serving the stale response when the revalidation fails", async () => {
        let isApiDown = false;
        const baseFetch = vi.fn<typeof fetch>(async () => {
            if (isApiDown) {
                throw new TypeError("fetch failed");
            }
            return Response.json({ version: 1 });
        });
        const cachingFetch = createCachingFetch(baseFetch, { revalidateInSeconds, store });

        await cachingFetch("https://api.example.com/graphql");
        isApiDown = true;
        vi.advanceTimersByTime((revalidateInSeconds + 1) * 1000);

        expect(await (await cachingFetch("https://api.example.com/graphql")).json()).toEqual({ version: 1 });
        await vi.waitFor(() =>
            expect(console.error).toHaveBeenCalledWith("FetchCache: background revalidation failed", expect.any(String), expect.any(TypeError)),
        );
        expect(await (await cachingFetch("https://api.example.com/graphql")).json()).toEqual({ version: 1 });
    });
});
