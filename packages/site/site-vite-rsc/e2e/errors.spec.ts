import { expect, test } from "@playwright/test";

import { noStoreCacheControl } from "./helpers.js";

test.describe("HTML request", () => {
    test("renders the error page with status 500 when a server component fails", async ({ request }) => {
        const response = await request.get("/server-error");

        expect(response.status()).toBe(500);
        expect(response.headers()["content-type"]).toBe("text/html;charset=utf-8");
        expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
        expect(await response.text()).toContain("Error page");
    });

    test("renders the error page with status 500 when a client component fails during SSR", async ({ request }) => {
        const response = await request.get("/client-error");

        expect(response.status()).toBe(500);
        expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
        expect(await response.text()).toContain("Error page");
    });

    test("falls back to plain text when the error page fails too", async ({ request }) => {
        const response = await request.get("/error-in-error-page");

        expect(response.status()).toBe(500);
        expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
        expect(await response.text()).toBe("Internal Server Error");
    });
});

test.describe("RSC request", () => {
    test("sends the payload with the error to the browser's error boundary, without caching it", async ({ request }) => {
        const response = await request.get("/_rsc/server-error");

        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toBe("text/x-component;charset=utf-8");
        expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);
    });

    test("doesn't expose the error message in production", async ({ request }) => {
        test.skip(test.info().project.name !== "build", "React only sends error messages to the browser in development");

        const body = await (await request.get("/_rsc/server-error")).text();

        expect(body).not.toContain("Server component failed");
    });
});

test("answers with status 500 when a route handler fails", async ({ request }) => {
    const response = await request.get("/error-in-handler");

    expect(response.status()).toBe(500);
    expect(await response.text()).toBe("Internal Server Error");
});
