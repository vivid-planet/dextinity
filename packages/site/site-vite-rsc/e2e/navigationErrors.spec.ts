import { type APIResponse, expect, test } from "@playwright/test";

import { noStoreCacheControl, publicCacheControl, requestTypes } from "./helpers.js";

for (const { name, prefix, contentType } of requestTypes) {
    test.describe(name, () => {
        test("renders the not found page with status 404 when notFound() is called deep in the tree", async ({ request }) => {
            const response = await request.get(`${prefix}/not-found`);

            expect(response.status()).toBe(404);
            expect(response.headers()["content-type"]).toBe(contentType);
            expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
            const body = await response.text();
            expect(body).toContain("Not found page");
            expect(body).not.toContain("Content before");
        });

        test("renders the not found page with status 404 when notFound() is called inside a Suspense boundary", async ({ request }) => {
            const response = await request.get(`${prefix}/not-found-in-suspense`);

            expect(response.status()).toBe(404);
            const body = await response.text();
            expect(body).toContain("Not found page");
            expect(body).not.toContain("Loading");
        });

        test("fails when notFound() is called while rendering the not found page", async ({ request }) => {
            const response = await request.get(`${prefix}/not-found-in-not-found-page`);

            expect(response.status()).toBe(500);
        });
    });
}

test.describe("HTML request", () => {
    test("redirects with status 307 when redirect() is called deep in the tree", async ({ request }) => {
        const response = await request.get("/redirect", { maxRedirects: 0 });

        expect(response.status()).toBe(307);
        expect(response.headers()["location"]).toBe("/request");
        expect(response.headers()["cache-control"]).toBe(publicCacheControl);
    });

    for (const status of [301, 302, 308]) {
        test(`redirects with the given status ${status}`, async ({ request }) => {
            const response = await request.get(`/redirect?status=${status}`, { maxRedirects: 0 });

            expect(response.status()).toBe(status);
            expect(response.headers()["location"]).toBe("/request");
        });
    }

    test("redirects to other origins", async ({ request }) => {
        const response = await request.get(`/redirect?location=${encodeURIComponent("https://example.com/target")}`, { maxRedirects: 0 });

        expect(response.headers()["location"]).toBe("https://example.com/target");
    });

    test("redirects when redirect() is called in a route handler", async ({ request }) => {
        const response = await request.get("/redirect-in-handler", { maxRedirects: 0 });

        expect(response.status()).toBe(307);
        expect(response.headers()["location"]).toBe("/request");
    });

    test("fails when redirect() is called with a location the browser mustn't navigate to", async ({ request }) => {
        const response = await request.get(`/redirect?location=${encodeURIComponent("javascript:alert(1)")}`, { maxRedirects: 0 });

        expect(response.status()).toBe(500);
        expect(response.headers()["location"]).toBeUndefined();
        expect(await response.text()).toContain("Error page");
    });

    test("follows redirects to the target page", async ({ request }) => {
        const response = await request.get("/redirect");

        expect(response.url()).toMatch(/\/request$/);
        expect(await response.text()).toContain("Server pathname: /request");
    });
});

// fetch() in the browser would follow redirects itself, which fails for other origins
test.describe("RSC request", () => {
    async function expectRedirectPayload(response: APIResponse, { location, cacheControl }: { location: string; cacheControl: string }) {
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toBe("text/x-component;charset=utf-8");
        expect(response.headers()["cache-control"]).toBe(cacheControl);
        expect(response.headers()["x-robots-tag"]).toBe("noindex");
        expect(response.headers()["location"]).toBeUndefined();
        expect(await response.text()).toContain(`{"redirect":{"location":${JSON.stringify(location)}}}`);
    }

    test("responds with a redirect payload, cached like the page, when redirect() is called deep in the tree", async ({ request }) => {
        await expectRedirectPayload(await request.get("/_rsc/redirect", { maxRedirects: 0 }), {
            location: "/request",
            cacheControl: publicCacheControl,
        });
    });

    for (const status of [301, 302, 308]) {
        test(`responds with a redirect payload for status ${status}`, async ({ request }) => {
            await expectRedirectPayload(await request.get(`/_rsc/redirect?status=${status}`, { maxRedirects: 0 }), {
                location: "/request",
                cacheControl: publicCacheControl,
            });
        });
    }

    test("keeps the search of the redirect location", async ({ request }) => {
        const response = await request.get(`/_rsc/redirect?location=${encodeURIComponent("/request?page=2")}`, { maxRedirects: 0 });

        await expectRedirectPayload(response, { location: "/request?page=2", cacheControl: publicCacheControl });
    });

    test("keeps redirects to other origins", async ({ request }) => {
        const response = await request.get(`/_rsc/redirect?location=${encodeURIComponent("https://example.com/target")}`, {
            maxRedirects: 0,
        });

        await expectRedirectPayload(response, { location: "https://example.com/target", cacheControl: publicCacheControl });
    });

    test("responds with an uncached redirect payload when redirect() is called in a route handler", async ({ request }) => {
        await expectRedirectPayload(await request.get("/_rsc/redirect-in-handler", { maxRedirects: 0 }), {
            location: "/request",
            cacheControl: noStoreCacheControl,
        });
    });

    test("responds with a redirect payload for redirects of route handlers", async ({ request }) => {
        const response = await request.get(`/_rsc/raw-redirect?location=${encodeURIComponent("mailto:office@example.com")}`, {
            maxRedirects: 0,
        });

        await expectRedirectPayload(response, { location: "mailto:office@example.com", cacheControl: noStoreCacheControl });
    });

    test("keeps the headers of the redirect, e.g. cookies, but doesn't cache it then", async ({ request }) => {
        const response = await request.get("/_rsc/redirect-with-cookie", { maxRedirects: 0 });

        await expectRedirectPayload(response, { location: "/request", cacheControl: noStoreCacheControl });
        expect(response.headers()["set-cookie"]).toBe("redirected=1; Path=/");
    });

    test("sends the error of redirect() with a location the browser mustn't navigate to to the error boundary", async ({ request }) => {
        const response = await request.get(`/_rsc/redirect?location=${encodeURIComponent("javascript:alert(1)")}`, { maxRedirects: 0 });

        expect(response.status()).toBe(200);
        expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
        expect(await response.text()).not.toContain('{"redirect":');
    });

    test("fails for redirects of route handlers to locations the browser mustn't navigate to", async ({ request }) => {
        const response = await request.get(`/_rsc/raw-redirect?location=${encodeURIComponent("javascript:alert(1)")}`, {
            maxRedirects: 0,
        });

        expect(response.status()).toBe(500);
        expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
        expect(response.headers()["location"]).toBeUndefined();
    });
});

test("renders the not found page with status 404 when a client component calls notFound() during SSR", async ({ request }) => {
    const response = await request.get("/not-found-in-client-component");

    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
    expect(await response.text()).toContain("Not found page");
});
