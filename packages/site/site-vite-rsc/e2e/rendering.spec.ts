import { expect, test } from "@playwright/test";

import { publicCacheControl, requestTypes } from "./helpers.js";

for (const { name, prefix, contentType } of requestTypes) {
    test.describe(name, () => {
        test("renders the page with the cache control of the route", async ({ request }) => {
            const response = await request.get(`${prefix}/`);

            expect(response.status()).toBe(200);
            expect(response.headers()["content-type"]).toBe(contentType);
            expect(response.headers()["cache-control"]).toBe(publicCacheControl);
            expect(await response.text()).toContain("Home page");
        });

        test("provides the request without the RSC prefix to server and client components", async ({ request }) => {
            const response = await request.get(`${prefix}/request?page=2`);

            const body = await response.text();
            expect(body).toContain(`Server pathname: /request, search: ?page=2, RSC request: ${prefix !== ""}`);
            if (prefix === "") {
                // Client components are only rendered for HTML requests on the server
                expect(body).toContain("Client pathname: /request, page: 2");
            }
        });
    });
}

test("marks only RSC responses as noindex, crawlers need the HTML", async ({ request }) => {
    expect((await request.get("/")).headers()["x-robots-tag"]).toBeUndefined();
    expect((await request.get("/_rsc/")).headers()["x-robots-tag"]).toBe("noindex");
});

test("embeds the RSC payload into the HTML for hydration", async ({ request }) => {
    const body = await (await request.get("/")).text();

    expect(body).toMatch(/^<!DOCTYPE html>/);
    expect(body).toContain("self.__FLIGHT_DATA");
});

test("only strips the RSC prefix as a whole path segment", async ({ request }) => {
    expect((await request.get("/_rscx")).status()).toBe(404);
});
