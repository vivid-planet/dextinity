import { randomUUID } from "node:crypto";

import { type APIRequestContext, expect, test } from "@playwright/test";

import { noStoreCacheControl, publicCacheControl, requestTypes } from "./helpers.js";

const concurrentRequestCount = 5;
const renderDelay = 500;

function createCountedRenderPath(id: string, { prefix = "", search = "" }: { prefix?: string; search?: string } = {}) {
    return `${prefix}/counted-render?id=${id}&delay=${renderDelay}${search}`;
}

async function getRenderCount(request: APIRequestContext, id: string) {
    return (await (await request.get(`/counted-render-count?id=${id}`)).json()) as number;
}

for (const { name, prefix, contentType } of requestTypes) {
    test.describe(name, () => {
        test("renders concurrent identical requests once, each gets the whole response", async ({ request }) => {
            const id = randomUUID();

            const responses = await Promise.all(
                Array.from({ length: concurrentRequestCount }, () => request.get(createCountedRenderPath(id, { prefix }))),
            );

            expect(await getRenderCount(request, id)).toBe(1);
            const bodies = await Promise.all(responses.map((response) => response.text()));
            for (const [index, response] of responses.entries()) {
                expect(response.status()).toBe(200);
                expect(response.headers()["content-type"]).toBe(contentType);
                expect(response.headers()["cache-control"]).toBe(publicCacheControl);
                expect(response.headers()["x-robots-tag"]).toBe(prefix ? "noindex" : undefined);
                expect(bodies[index]).toBe(bodies[0]);
            }
            expect(bodies[0]).toContain(`Counted render 1 of ${id}`);
        });

        test("gives every concurrent request the error page when the shared render fails", async ({ request }) => {
            const id = randomUUID();

            const responses = await Promise.all(
                Array.from({ length: concurrentRequestCount }, () => request.get(createCountedRenderPath(id, { prefix, search: "&fail" }))),
            );

            expect(await getRenderCount(request, id)).toBe(1);
            for (const response of responses) {
                // An RSC payload with errors is handled by the error boundaries in the browser
                expect(response.status()).toBe(prefix ? 200 : 500);
                expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
                if (!prefix) {
                    expect(await response.text()).toContain("Error page");
                }
            }
        });
    });
}

test("renders sequential requests each time", async ({ request }) => {
    const id = randomUUID();

    await request.get(createCountedRenderPath(id));
    const response = await request.get(createCountedRenderPath(id));

    expect(await response.text()).toContain(`Counted render 2 of ${id}`);
});

test("doesn't share the render between HTML and RSC requests", async ({ request }) => {
    const id = randomUUID();

    await Promise.all([request.get(createCountedRenderPath(id)), request.get(createCountedRenderPath(id, { prefix: "/_rsc" }))]);

    expect(await getRenderCount(request, id)).toBe(2);
});

test("doesn't share the render between different search params", async ({ request }) => {
    const id = randomUUID();

    await Promise.all([request.get(createCountedRenderPath(id)), request.get(createCountedRenderPath(id, { search: "&page=2" }))]);

    expect(await getRenderCount(request, id)).toBe(2);
});

test("doesn't share the render between hosts", async ({ request, baseURL }) => {
    const id = randomUUID();
    const { port } = new URL(baseURL ?? "");

    await Promise.all([
        request.get(createCountedRenderPath(id)),
        request.get(createCountedRenderPath(id), { headers: { host: `other.localhost:${port}` } }),
        request.get(createCountedRenderPath(id), { headers: { "x-forwarded-host": "other.example.com" } }),
    ]);

    expect(await getRenderCount(request, id)).toBe(3);
});

test("doesn't share the render between different cookies", async ({ request }) => {
    const id = randomUUID();

    await Promise.all([request.get(createCountedRenderPath(id)), request.get(createCountedRenderPath(id), { headers: { cookie: "a=1" } })]);

    expect(await getRenderCount(request, id)).toBe(2);
});

test("doesn't share the render with the site preview", async ({ request }) => {
    const id = randomUUID();

    const responses = await Promise.all([
        request.get(createCountedRenderPath(id)),
        request.get(createCountedRenderPath(id), { headers: { "x-test-site-preview": "" } }),
        request.get(createCountedRenderPath(id), { headers: { "x-test-site-preview": "" } }),
    ]);

    expect(await getRenderCount(request, id)).toBe(3);
    for (const response of responses) {
        expect(response.status()).toBe(200);
    }
});

test("renders each request when the page opts out", async ({ request }) => {
    const id = randomUUID();

    await Promise.all(
        Array.from({ length: concurrentRequestCount }, () => request.get(createCountedRenderPath(id, { search: "&coalesceRenders=false" }))),
    );

    expect(await getRenderCount(request, id)).toBe(concurrentRequestCount);
});
