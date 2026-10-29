import { expect, test } from "@playwright/test";

import { requestTypes } from "./helpers.js";

for (const { name, prefix } of requestTypes) {
    test.describe(name, () => {
        test("redirects URLs with a trailing slash permanently to the URL without", async ({ request }) => {
            const response = await request.get(`${prefix}/request/?page=2`, { maxRedirects: 0 });

            expect(response.status()).toBe(308);
            expect(response.headers()["location"]).toBe(`${prefix}/request?page=2`);
        });

        test("doesn't redirect the root page", async ({ request }) => {
            const response = await request.get(`${prefix}/`, { maxRedirects: 0 });

            expect(response.status()).toBe(200);
        });

        test("doesn't redirect to another host", async ({ request, baseURL }) => {
            // A relative "//example.com/" would be requested from example.com
            const response = await request.get(`${baseURL}${prefix}//example.com/`, { maxRedirects: 0 });

            expect(response.status()).toBe(308);
            expect(response.headers()["location"]).toBe(`${prefix}/example.com`);
        });
    });
}
