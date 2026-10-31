// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { createCoalescer, getRenderCoalescingKey } from "./renderCoalescing.js";

const publicCacheControl = "public, s-maxage=60";

function getKey({
    url = "https://example.com/en?page=2",
    method = "GET",
    headers,
    routedUrl = url,
    isRscRequest = false,
    isPreview = false,
    cacheControl = publicCacheControl,
}: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    routedUrl?: string;
    isRscRequest?: boolean;
    isPreview?: boolean;
    cacheControl?: string;
} = {}) {
    return getRenderCoalescingKey({ request: new Request(url, { method, headers }), routedUrl, isRscRequest, isPreview, cacheControl });
}

describe("getRenderCoalescingKey", () => {
    it("is the same for identical requests", () => {
        expect(getKey()).toBeDefined();
        expect(getKey()).toBe(getKey());
    });

    it("is the same for GET and HEAD, as both render the body", () => {
        expect(getKey({ method: "HEAD" })).toBe(getKey());
    });

    it("ignores headers the render doesn't read", () => {
        expect(getKey({ headers: { "user-agent": "a", accept: "text/html" } })).toBe(getKey({ headers: { "user-agent": "b" } }));
    });

    it.each([
        ["host", { url: "https://other.example.com/en?page=2" }],
        ["path", { url: "https://example.com/de?page=2" }],
        ["search params", { url: "https://example.com/en?page=3" }],
        ["routed URL", { routedUrl: "https://example.com/en/rewritten" }],
        ["RSC request", { isRscRequest: true }],
        ["cookies", { headers: { cookie: "a=1" } }],
        ["forwarded host", { headers: { "x-forwarded-host": "other.example.com" } }],
        ["forwarded protocol", { headers: { "x-forwarded-proto": "http" } }],
        ["forwarded header", { headers: { forwarded: "host=other.example.com" } }],
    ])("differs by %s", (_name, options) => {
        expect(getKey(options)).toBeDefined();
        expect(getKey(options)).not.toBe(getKey());
    });

    it.each([
        ["POST requests", { method: "POST" }],
        ["previews", { isPreview: true }],
        ["requests with authorization", { headers: { authorization: "Basic abc" } }],
        ["block preview requests", { headers: { "x-block-preview": "jwt" } }],
        ["private pages", { cacheControl: "private, max-age=60" }],
        ["uncached pages", { cacheControl: "private, no-cache, no-store, max-age=0, must-revalidate" }],
        ["pages revalidated on every request", { cacheControl: "No-Cache" }],
    ])("isn't created for %s", (_name, options) => {
        expect(getKey(options)).toBeUndefined();
    });
});

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe("createCoalescer", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("runs concurrent calls with the same key once", async () => {
        const coalescer = createCoalescer<string>({ maxWaitMs: 1000 });
        const deferred = createDeferred<string>();
        const run = vi.fn(() => deferred.promise);

        const results = Promise.all([coalescer.run("a", run), coalescer.run("a", run), coalescer.run("a", run)]);
        deferred.resolve("result");

        expect(await results).toEqual(["result", "result", "result"]);
        expect(run).toHaveBeenCalledTimes(1);
    });

    it("doesn't share between keys", async () => {
        const coalescer = createCoalescer<string>({ maxWaitMs: 1000 });

        const results = await Promise.all([coalescer.run("a", async () => "a"), coalescer.run("b", async () => "b")]);

        expect(results).toEqual(["a", "b"]);
    });

    it("removes the run when it settles, so that later calls run again", async () => {
        const coalescer = createCoalescer<number>({ maxWaitMs: 1000 });
        const run = vi.fn(async () => run.mock.calls.length);

        expect(await coalescer.run("a", run)).toBe(1);
        expect(coalescer.size).toBe(0);
        expect(await coalescer.run("a", run)).toBe(2);
    });

    it("rejects all calls and removes the run when it fails", async () => {
        const coalescer = createCoalescer<string>({ maxWaitMs: 1000 });
        const deferred = createDeferred<string>();
        const error = new Error("Render failed");

        const results = Promise.allSettled([coalescer.run("a", () => deferred.promise), coalescer.run("a", () => deferred.promise)]);
        deferred.reject(error);

        expect(await results).toEqual([
            { status: "rejected", reason: error },
            { status: "rejected", reason: error },
        ]);
        expect(coalescer.size).toBe(0);
        expect(await coalescer.run("a", async () => "retried")).toBe("retried");
    });

    it("removes the run when it throws synchronously", async () => {
        const coalescer = createCoalescer<string>({ maxWaitMs: 1000 });

        await expect(
            coalescer.run("a", () => {
                throw new Error("Render failed");
            }),
        ).rejects.toThrow("Render failed");
        expect(coalescer.size).toBe(0);
    });

    it("lets calls run on their own when the shared run takes longer than maxWaitMs", async () => {
        vi.useFakeTimers();
        const coalescer = createCoalescer<string>({ maxWaitMs: 1000 });
        const stuck = createDeferred<string>();

        const first = coalescer.run("a", () => stuck.promise);
        const waiting = coalescer.run("a", async () => "own");
        await vi.advanceTimersByTimeAsync(1000);

        expect(await waiting).toBe("own");
        expect(coalescer.size).toBe(0);
        expect(await coalescer.run("a", async () => "new run")).toBe("new run");

        stuck.resolve("late");
        expect(await first).toBe("late");
        expect(coalescer.size).toBe(0);
    });
});
