import { expect, openPage, test } from "./browserTest.js";
import { noStoreCacheControl, publicCacheControl, requestTypes } from "./helpers.js";

const botUserAgent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

/**
 * Reads the response like a browser, to see what arrives before the slow content, which takes `?delay` (300 ms)
 */
async function fetchStreamed(url: string, { headers }: { headers?: HeadersInit } = {}) {
    const startTime = performance.now();
    const response = await fetch(url, { headers, redirect: "manual" });
    if (!response.body) {
        throw new Error(`${url} responded without body`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let body = "";
    let firstChunk: string | undefined;
    let timeToFirstChunk: number | undefined;
    for (let result = await reader.read(); !result.done; result = await reader.read()) {
        body += decoder.decode(result.value, { stream: true });
        if (firstChunk === undefined) {
            firstChunk = body;
            timeToFirstChunk = performance.now() - startTime;
        }
    }
    return { response, firstChunk: firstChunk ?? "", timeToFirstChunk: timeToFirstChunk ?? 0, body };
}

for (const { name, prefix, contentType } of requestTypes) {
    test.describe(name, () => {
        test("streams uncached pages, the first bytes arrive before the slow content", async ({ baseURL }) => {
            const { response, firstChunk, timeToFirstChunk, body } = await fetchStreamed(`${baseURL}${prefix}/streaming/slow?delay=1000`);

            expect(response.status).toBe(200);
            expect(response.headers.get("content-type")).toBe(contentType);
            expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
            expect(timeToFirstChunk).toBeLessThan(900);
            expect(firstChunk).toContain("Shell content");
            expect(firstChunk).not.toContain("Slow content");
            expect(body).toContain("Slow content");
        });

        test("buffers pages cached by the CDN, so that failed pages aren't cached", async ({ baseURL }) => {
            const { response, timeToFirstChunk, firstChunk } = await fetchStreamed(`${baseURL}${prefix}/streaming/slow?cache=public`);

            expect(response.headers.get("cache-control")).toBe(publicCacheControl);
            expect(timeToFirstChunk).toBeGreaterThanOrEqual(300);
            expect(firstChunk).toContain("Slow content");
        });

        test("streams pages cached by the CDN with streaming: true", async ({ baseURL }) => {
            const { response, firstChunk } = await fetchStreamed(`${baseURL}${prefix}/streaming/slow?cache=public&streaming=true&delay=1000`);

            expect(response.headers.get("cache-control")).toBe(publicCacheControl);
            expect(firstChunk).not.toContain("Slow content");
        });

        test("buffers uncached pages with streaming: false", async ({ baseURL }) => {
            const { firstChunk } = await fetchStreamed(`${baseURL}${prefix}/streaming/slow?streaming=false`);

            expect(firstChunk).toContain("Slow content");
        });

        test("buffers the page for bots, so that they get the status of notFound() inside a Suspense boundary", async ({ baseURL }) => {
            const { response, body } = await fetchStreamed(`${baseURL}${prefix}/streaming/not-found`, { headers: { "User-Agent": botUserAgent } });

            expect(response.status).toBe(404);
            expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
            expect(body).toContain("Not found page");
        });
    });
}

test.describe("HTML request", () => {
    test("renders the not found page with status 404 when notFound() is called in the shell", async ({ baseURL }) => {
        const { response, body } = await fetchStreamed(`${baseURL}/streaming/not-found-in-shell`);

        expect(response.status).toBe(404);
        expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
        expect(body).toContain("Not found page");
        expect(body).not.toContain("Shell content");
    });

    test("renders the error page with status 500 when the shell fails", async ({ baseURL }) => {
        const { response, body } = await fetchStreamed(`${baseURL}/streaming/error-in-shell`);

        expect(response.status).toBe(500);
        expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
        expect(body).toContain("Error page");
    });

    test("redirects when redirect() is called in the shell", async ({ baseURL }) => {
        const { response } = await fetchStreamed(`${baseURL}/streaming/redirect-in-shell`);

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("/request");
    });

    test("marks the page as noindex when notFound() is called after the response started", async ({ baseURL }) => {
        const { response, body } = await fetchStreamed(`${baseURL}/streaming/not-found`);

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
        expect(body).toContain('<meta name="robots" content="noindex">');
    });

    test("marks the page as noindex when a client component calls notFound() after the response started", async ({ baseURL }) => {
        const { body } = await fetchStreamed(`${baseURL}/streaming/not-found-in-client-component`);

        expect(body).toContain('<meta name="robots" content="noindex">');
    });

    test("redirects with a meta refresh when redirect() is called after the response started", async ({ baseURL }) => {
        const location = "/request?a=1&b=2";
        const { response, body } = await fetchStreamed(`${baseURL}/streaming/redirect?location=${encodeURIComponent(location)}`);

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
        expect(body).toContain('<meta http-equiv="refresh" content="0;url=/request?a=1&amp;b=2">');
    });

    test("doesn't cache the page when it fails after the response started", async ({ baseURL }) => {
        const { response } = await fetchStreamed(`${baseURL}/streaming/error`);

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
    });
});

test.describe("RSC request", () => {
    test("leaves notFound() and errors to the browser, as RSC payloads have no shell", async ({ baseURL }) => {
        for (const path of ["/streaming/not-found-in-shell", "/streaming/error-in-shell"]) {
            const { response } = await fetchStreamed(`${baseURL}/_rsc${path}`);

            expect(response.status).toBe(200);
            expect(response.headers.get("cache-control")).toBe(noStoreCacheControl);
        }
    });

    test("renders the not found page for the not found request of the browser", async ({ request }) => {
        const response = await request.get("/_rsc/streaming/not-found?_rsc_not_found");

        expect(response.status()).toBe(404);
        expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
        expect(await response.text()).toContain("Not found page");
    });
});

test.describe("browser", () => {
    test("shows the fallback, then the slow content", async ({ page }) => {
        await page.goto("/streaming/slow?delay=1000", { waitUntil: "commit" });

        await expect(page.getByText("Loading slow content")).toBeVisible();
        await expect(page.getByText("Slow content", { exact: true })).toBeVisible();
        await expect(page.getByText("Loading slow content")).toBeHidden();
    });

    test("shows the fallback, then the slow content after a client navigation", async ({ page, documentRequests }) => {
        await openPage(page, "/pages/first");

        await page.getByRole("link", { name: "Streamed page", exact: true }).click();

        await expect(page.getByText("Loading slow content")).toBeVisible();
        await expect(page.getByText("Slow content", { exact: true })).toBeVisible();
        expect(documentRequests).toEqual(["/pages/first"]);
    });

    test("shows the not found page when notFound() is called after the response started", async ({ page, rscRequests, allowConsoleErrors }) => {
        allowConsoleErrors(/status of 404/);
        await openPage(page, "/streaming/not-found");

        await expect(page.getByText("Not found page")).toBeVisible();
        await expect(page).toHaveURL(/\/streaming\/not-found$/);
        expect(rscRequests).toEqual(["/streaming/not-found?_rsc_not_found="]);
    });

    test("shows the not found page when notFound() is called after the response of a client navigation started", async ({
        page,
        documentRequests,
        allowConsoleErrors,
    }) => {
        allowConsoleErrors(/status of 404/);
        await openPage(page, "/pages/first");

        await page.getByRole("link", { name: "Streamed not found", exact: true }).click();

        await expect(page.getByText("Not found page")).toBeVisible();
        await expect(page).toHaveURL(/\/streaming\/not-found$/);
        expect(documentRequests).toEqual(["/pages/first"]);
    });

    test("follows redirect() called after the response started", async ({ page }) => {
        await page.goto("/streaming/redirect");

        await expect(page.getByText("Server pathname: /request")).toBeVisible();
        await expect(page).toHaveURL(/\/request$/);
    });

    test("follows redirect() called after the response of a client navigation started", async ({ page, documentRequests, rscRequests }) => {
        await openPage(page, "/pages/first");

        await page.getByRole("link", { name: "Streamed redirect", exact: true }).click();

        await expect(page.getByText("Server pathname: /request")).toBeVisible();
        await expect(page).toHaveURL(/\/request$/);
        expect(documentRequests).toEqual(["/pages/first"]);
        expect(rscRequests).toEqual(["/streaming/redirect", "/request"]);
    });

    test("shows the error page when the page fails after the response started", async ({ page, allowConsoleErrors }) => {
        allowConsoleErrors(/Server component failed|Minified React error #441/);
        await page.goto("/streaming/error");

        await expect(page.getByText("Something went wrong.")).toBeVisible();
    });
});
