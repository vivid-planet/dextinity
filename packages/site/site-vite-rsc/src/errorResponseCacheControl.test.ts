// @vitest-environment node
import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { noStoreCacheControl } from "./cacheControl.js";
import { errorResponseCacheControlMiddleware } from "./errorResponseCacheControl.js";

const app = new Hono();
app.use(errorResponseCacheControlMiddleware);
app.get("/ok", (c) => c.text("ok", 200, { "Cache-Control": "public, max-age=900" }));
app.get("/redirect", (c) => c.redirect("/ok", 307));
app.get("/bad-request", (c) => c.text("bad request", 400, { "Cache-Control": "public, max-age=900" }));

describe("errorResponseCacheControlMiddleware", () => {
    it("doesn't cache error responses, even if they set a cache control", async () => {
        expect((await app.request("/bad-request")).headers.get("Cache-Control")).toBe(noStoreCacheControl);
        expect((await app.request("/unknown")).headers.get("Cache-Control")).toBe(noStoreCacheControl);
    });

    it("keeps the cache control of other responses", async () => {
        expect((await app.request("/ok")).headers.get("Cache-Control")).toBe("public, max-age=900");
        expect((await app.request("/redirect")).headers.get("Cache-Control")).toBeNull();
    });
});
