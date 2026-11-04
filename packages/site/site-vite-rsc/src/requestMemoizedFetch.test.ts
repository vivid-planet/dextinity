// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runWithRequestContext } from "./requestContext.js";
import { createRequestMemoizedFetch } from "./requestMemoizedFetch.js";

const url = "https://api.example.com/data";

function runInRequest<T>(callback: () => T): T {
    return runWithRequestContext({ request: new Request("https://www.example.com/en"), isRscRequest: false }, callback);
}

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe("createRequestMemoizedFetch", () => {
    const baseFetch = vi.fn<typeof fetch>();

    beforeEach(() => {
        baseFetch.mockImplementation(async () => Response.json({ value: "content" }));
    });

    afterEach(() => {
        baseFetch.mockReset();
    });

    it("sends identical GET requests only once per request", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        const bodies = await runInRequest(async () => {
            const concurrent = await Promise.all([memoizedFetch(url), memoizedFetch(url)]);
            const later = await memoizedFetch(new URL(url), { headers: {} });
            return Promise.all([...concurrent, later].map((response) => response.json()));
        });

        expect(bodies).toEqual([{ value: "content" }, { value: "content" }, { value: "content" }]);
        expect(baseFetch).toHaveBeenCalledTimes(1);
    });

    it("returns a response with the status and headers to each caller", async () => {
        baseFetch.mockImplementation(async () => new Response("text", { status: 203, statusText: "Copy", headers: { "x-test": "1" } }));
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await runInRequest(async () => {
            for (const response of [await memoizedFetch(url), await memoizedFetch(url)]) {
                expect(response.status).toBe(203);
                expect(response.statusText).toBe("Copy");
                expect(response.headers.get("x-test")).toBe("1");
                expect(await response.text()).toBe("text");
            }
        });
    });

    it("distinguishes requests by method, URL, headers and body", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch, { isMemoizable: () => true });

        await runInRequest(async () => {
            await memoizedFetch(url, { method: "POST", body: "a" });
            await memoizedFetch(url, { method: "POST", body: "b" });
            await memoizedFetch(url, { method: "POST", body: "a", headers: { "x-include-invisible-content": "Pages:Unpublished" } });
            await memoizedFetch(url, { method: "PUT", body: "a" });
            await memoizedFetch(`${url}?other`, { method: "POST", body: "a" });
            await memoizedFetch(url, { method: "POST", body: "a" });
        });

        expect(baseFetch).toHaveBeenCalledTimes(5);
    });

    it("ignores the trace context headers", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await runInRequest(async () => {
            await memoizedFetch(url, { headers: { traceparent: "00-a-01-01" } });
            await memoizedFetch(url, { headers: { traceparent: "00-b-02-01" } });
        });

        expect(baseFetch).toHaveBeenCalledTimes(1);
    });

    it("sends the body unchanged", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch, { isMemoizable: () => true });
        const body = new Uint8Array([0, 255, 128]);

        await runInRequest(() => memoizedFetch(url, { method: "POST", body }));

        expect(new Uint8Array(baseFetch.mock.calls[0][1]?.body as Uint8Array)).toEqual(body);
    });

    it("doesn't memoize POST requests by default", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await runInRequest(async () => {
            await memoizedFetch(url, { method: "POST", body: "a" });
            await memoizedFetch(url, { method: "POST", body: "a" });
        });

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("doesn't share responses between requests", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await Promise.all([runInRequest(() => memoizedFetch(url)), runInRequest(() => memoizedFetch(url))]);

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("doesn't memoize outside of requests", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await memoizedFetch(url);
        await memoizedFetch(url);

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("doesn't memoize requests with a signal, which controls their lifetime", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);
        const { signal } = new AbortController();

        await runInRequest(async () => {
            await memoizedFetch(url);
            await memoizedFetch(url, { signal });
        });

        expect(baseFetch).toHaveBeenCalledTimes(2);
        expect(baseFetch.mock.calls[1][1]?.signal).toBe(signal);
    });

    it("doesn't pass the signal of the request to the shared upstream request", async () => {
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await runInRequest(() => memoizedFetch(new Request(url)));

        expect(baseFetch.mock.calls[0][1]?.signal).toBeUndefined();
    });

    it("shares a failed response while in flight, but sends the next identical request again", async () => {
        const upstream = createDeferred<Response>();
        baseFetch.mockImplementationOnce(() => upstream.promise);
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await runInRequest(async () => {
            const concurrent = Promise.all([memoizedFetch(url), memoizedFetch(url)]);
            upstream.resolve(new Response("Bad Gateway", { status: 502 }));
            expect((await concurrent).map((response) => response.status)).toEqual([502, 502]);

            const retried = await memoizedFetch(url);
            expect(retried.status).toBe(200);
            await memoizedFetch(url);
        });

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("doesn't keep GraphQL errors", async () => {
        baseFetch.mockImplementation(async () => Response.json({ errors: [{ message: "Failed" }] }));
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await runInRequest(async () => {
            await memoizedFetch(url);
            await memoizedFetch(url);
        });

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("shares a network error while in flight, but sends the next identical request again", async () => {
        const upstream = createDeferred<Response>();
        baseFetch.mockImplementationOnce(() => upstream.promise);
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await runInRequest(async () => {
            const concurrent = Promise.allSettled([memoizedFetch(url), memoizedFetch(url)]);
            upstream.reject(new TypeError("fetch failed"));
            expect((await concurrent).map((result) => result.status)).toEqual(["rejected", "rejected"]);

            expect((await memoizedFetch(url)).status).toBe(200);
        });

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });

    it("returns null bodies for HEAD requests and statuses without body", async () => {
        baseFetch.mockImplementation(async () => new Response(null, { status: 204 }));
        const memoizedFetch = createRequestMemoizedFetch(baseFetch);

        await runInRequest(async () => {
            expect((await memoizedFetch(url)).body).toBeNull();
            expect((await memoizedFetch(url)).status).toBe(204);
            expect((await memoizedFetch(url, { method: "HEAD" })).body).toBeNull();
        });

        expect(baseFetch).toHaveBeenCalledTimes(2);
    });
});
