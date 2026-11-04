import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

const noStoreCacheControl = "private, no-cache, no-store, max-age=0, must-revalidate";

test("renders the page with the metadata of its route", async ({ request }) => {
    const html = await (await request.get("/")).text();

    expect(html).toContain("<title>Home</title>");
    expect(html).toContain('<meta name="description" content="The home page"/>');
    expect(html).toContain('<link rel="canonical" href="https://www.example.com/"/>');
});

test("renders images with the widths of the image config", async ({ request }) => {
    const html = await (await request.get("/")).text();

    expect(html).toContain('srcSet="/image/320/180/photo.jpg 320w, /image/640/360/photo.jpg 640w, /image/1200/675/photo.jpg 1200w"');
});

for (const path of ["/cached", "/cached.rsc"]) {
    test(`uses the Cache-Control of the route for ${path}`, async ({ request }) => {
        const response = await request.get(path);

        expect(response.status()).toBe(200);
        expect(response.headers()["cache-control"]).toBe("public, s-maxage=60");
    });
}

test("renders the error boundary with status 404 for a 404 of a loader and doesn't cache it", async ({ request }) => {
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

test("responds with status 500 for errors of server components and doesn't cache them", async ({ request }) => {
    const response = await request.get("/render-error");

    expect(response.status()).toBe(500);
    expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
});

test("doesn't cache the payload of client navigations with errors of server components", async ({ request }) => {
    const response = await request.get("/render-error.rsc");

    expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
});

test("redirects with the status of the loader", async ({ request }) => {
    const response = await request.get("/redirect", { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toBe("/cached");
});

test("makes the context of the request available to server components", async ({ request }) => {
    const responses = await Promise.all(
        ["a", "b", "c"].map((requestId) => request.get("/request-context", { headers: { "x-request-id": requestId } })),
    );

    for (const [index, requestId] of ["a", "b", "c"].entries()) {
        expect(await responses[index].text()).toContain(`Request <!-- -->${requestId}`);
    }
});

test("caches the responses of the fetch cache, unless they are no-store", async ({ request }) => {
    const first = await (await request.get("/fetch-cache")).text();
    const second = await (await request.get("/fetch-cache")).text();

    const cachedCounts = [first, second].map((html) => html.match(/Cached <!-- -->(\d+)/)?.[1]);
    const uncachedCounts = [first, second].map((html) => Number(html.match(/uncached <!-- -->(\d+)/)?.[1]));
    expect(cachedCounts[0]).toBe(cachedCounts[1]);
    expect(uncachedCounts[1]).toBeGreaterThan(uncachedCounts[0]);
});

test("responds with robots.txt and sitemap.xml", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.headers()["content-type"]).toBe("text/plain; charset=utf-8");
    expect(robots.headers()["cache-control"]).toBe("public, max-age=900");
    expect(await robots.text()).toBe("User-Agent: *\nAllow: /\n\nSitemap: https://www.example.com/sitemap.xml\n");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.headers()["content-type"]).toBe("application/xml; charset=utf-8");
    expect(await sitemap.text()).toContain("<loc>https://www.example.com/</loc>");
});

test.describe("production build", () => {
    test.skip(
        ({ baseURL }) => !baseURL?.endsWith(process.env.E2E_BUILD_PORT ?? "3921"),
        "Only the server of the build serves the static files and checks the CDN origin",
    );

    test("serves the build assets with a long cache duration", async ({ request }) => {
        const html = await (await request.get("/")).text();
        const assetPath = html.match(/\/_assets\/[^"]+\.js/)?.[0];

        const response = await request.get(assetPath ?? "");

        expect(response.status()).toBe(200);
        expect(response.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
    });

    test("rejects requests that didn't pass the CDN", async ({ request }) => {
        expect((await request.get("/cdn/anything")).status()).toBe(403);
        expect((await request.get("/cdn/anything", { headers: { "x-cdn-origin-check": "e2e-cdn-secret" } })).status()).toBe(404);
    });

    test("writes the queries of the client code to the persisted queries", async () => {
        const persistedQueries = JSON.parse(await readFile(new URL("fixture/build/persisted-queries.json", import.meta.url), "utf-8"));

        expect(Object.values(persistedQueries)).toEqual([expect.stringContaining("query E2EPersisted")]);
    });
});
