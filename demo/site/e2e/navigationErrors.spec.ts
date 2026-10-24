import { expect, test } from "@playwright/test";

import { noStoreCacheControl, requestTypes } from "./helpers";

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

        test("redirects with status 307 when redirect() is called deep in the tree", async ({ request }) => {
            const response = await request.get(`${prefix}/redirect`, { maxRedirects: 0 });

            expect(response.status()).toBe(307);
            expect(response.headers()["location"]).toBe(`${prefix}/request`);
        });

        for (const status of [301, 302, 308]) {
            test(`redirects with the given status ${status}`, async ({ request }) => {
                const response = await request.get(`${prefix}/redirect?status=${status}`, { maxRedirects: 0 });

                expect(response.status()).toBe(status);
                expect(response.headers()["location"]).toBe(`${prefix}/request`);
            });
        }

        test("keeps the search of the redirect location", async ({ request }) => {
            const response = await request.get(`${prefix}/redirect?location=${encodeURIComponent("/request?page=2")}`, { maxRedirects: 0 });

            expect(response.headers()["location"]).toBe(`${prefix}/request?page=2`);
        });

        test("redirects to other origins without the RSC prefix", async ({ request }) => {
            const response = await request.get(`${prefix}/redirect?location=${encodeURIComponent("https://example.com/target")}`, {
                maxRedirects: 0,
            });

            expect(response.headers()["location"]).toBe("https://example.com/target");
        });

        test("redirects when redirect() is called in a route handler", async ({ request }) => {
            const response = await request.get(`${prefix}/redirect-in-handler`, { maxRedirects: 0 });

            expect(response.status()).toBe(307);
            expect(response.headers()["location"]).toBe(`${prefix}/request`);
        });

        test("follows redirects to the target page", async ({ request }) => {
            const response = await request.get(`${prefix}/redirect`);

            expect(response.url()).toMatch(new RegExp(`${prefix}/request$`));
            expect(response.headers()["content-type"]).toBe(contentType);
            expect(await response.text()).toContain("Server pathname: /request");
        });
    });
}

test("renders the not found page with status 404 when a client component calls notFound() during SSR", async ({ request }) => {
    const response = await request.get("/not-found-in-client-component");

    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
    expect(await response.text()).toContain("Not found page");
});
