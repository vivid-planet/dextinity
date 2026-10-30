// @vitest-environment node
import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { noStoreCacheControl } from "./cacheControl.js";
import { cdnOriginCheckMiddleware } from "./cdnOriginCheck.js";

const app = new Hono();
app.use(cdnOriginCheckMiddleware({ secret: "secret" }));
app.get("/", (c) => c.text("ok"));

describe("cdnOriginCheckMiddleware", () => {
    it("rejects requests without the header", async () => {
        const response = await app.request("/");
        expect(response.status).toBe(403);
        expect(response.headers.get("Cache-Control")).toBe(noStoreCacheControl);
    });

    it("rejects requests with a wrong header", async () => {
        expect((await app.request("/", { headers: { "x-cdn-origin-check": "secreT" } })).status).toBe(403);
        expect((await app.request("/", { headers: { "x-cdn-origin-check": "secret-but-longer" } })).status).toBe(403);
        expect((await app.request("/", { headers: { "x-cdn-origin-check": "" } })).status).toBe(403);
    });

    it("passes requests with the right header through", async () => {
        const response = await app.request("/", { headers: { "x-cdn-origin-check": "secret" } });
        expect(response.status).toBe(200);
        expect(await response.text()).toBe("ok");
    });
});
