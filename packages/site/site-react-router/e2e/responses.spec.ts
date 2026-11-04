import { expect, test } from "@playwright/test";

const noStoreCacheControl = "private, no-cache, no-store, max-age=0, must-revalidate";

test("renders the page with the metadata of its route", async ({ request }) => {
    const html = await (await request.get("/")).text();

    expect(html).toContain("<title>Home</title>");
    expect(html).toContain('<link rel="canonical" href="https://www.example.com/"/>');
});

for (const path of ["/cached", "/cached.data"]) {
    test(`uses the Cache-Control of the loader for ${path}`, async ({ request }) => {
        const response = await request.get(path);

        expect(response.status()).toBe(200);
        expect(response.headers()["cache-control"]).toBe("public, s-maxage=60");
    });
}

test("renders the error boundary with status 404 for notFound()", async ({ request }) => {
    const response = await request.get("/not-found");

    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
    expect(await response.text()).toContain("Page error <!-- -->404");
});

test("renders the error boundary with status 500 for errors of loaders and doesn't cache them", async ({ request }) => {
    const response = await request.get("/server-error");

    expect(response.status()).toBe(500);
    expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
    expect(await response.text()).toContain("Page error <!-- -->500");
});

test("redirects with the response init of redirect()", async ({ request }) => {
    const response = await request.get("/redirect", { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toBe("/cached");
    expect(response.headers()["cache-control"]).toBe("public, s-maxage=60");
});

test("refuses unsafe redirect targets", async ({ request }) => {
    const response = await request.get("/unsafe-redirect", { maxRedirects: 0 });

    expect(response.status()).toBe(500);
    expect(response.headers()["location"]).toBeUndefined();
});

test("redirects URLs with a trailing slash permanently to the URL without", async ({ request }) => {
    const response = await request.get("/cached/?page=2", { maxRedirects: 0 });

    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toBe("/cached?page=2");
});

test("only answers requests with the CDN origin check header", async ({ request }) => {
    expect((await request.get("/cdn/page")).status()).toBe(403);
    expect((await request.get("/cdn/page", { headers: { "x-cdn-origin-check": "other" } })).status()).toBe(403);
    expect((await request.get("/cdn/page", { headers: { "x-cdn-origin-check": "cdn-secret" } })).status()).toBe(200);
});

test("renders the sitemap", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.headers()["content-type"]).toBe("application/xml");
    expect(await response.text()).toContain("<loc>https://www.example.com/</loc>");
});
