import { expect, test } from "@playwright/test";

test("redirects URLs with a trailing slash permanently to the URL without", async ({ request }) => {
    const response = await request.get("/request/?page=2", { maxRedirects: 0 });

    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toBe("/request?page=2");
});

test("redirects RSC requests with a trailing slash with a redirect payload", async ({ request }) => {
    const response = await request.get("/_rsc/request/?page=2", { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('{"redirect":{"location":"/request?page=2"}}');
});

for (const prefix of ["", "/_rsc"]) {
    test(`doesn't redirect the root page${prefix ? " of RSC requests" : ""}`, async ({ request }) => {
        const response = await request.get(`${prefix}/`, { maxRedirects: 0 });

        expect(response.status()).toBe(200);
    });
}

test("doesn't redirect to another host", async ({ request, baseURL }) => {
    // A relative "//example.com/" would be requested from example.com
    const response = await request.get(`${baseURL}//example.com/`, { maxRedirects: 0 });

    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toBe("/example.com");
});

test("doesn't redirect RSC requests to another host", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/_rsc//example.com/`, { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('{"redirect":{"location":"/example.com"}}');
});
