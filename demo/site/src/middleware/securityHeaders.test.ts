// @vitest-environment node
import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { securityHeadersMiddleware } from "./securityHeaders";

const app = new Hono();
app.use(securityHeadersMiddleware);
app.get("/page", (c) => c.text("page"));
app.get("/proxied", () => new Response("file", { headers: { "Cross-Origin-Resource-Policy": "cross-origin" } }));

describe("securityHeadersMiddleware", () => {
    it("sets the security headers", async () => {
        const response = await app.request("/page");

        expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
        expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(response.headers.get("Permissions-Policy")).toBe("");
    });

    it("keeps the headers set by the response", async () => {
        const response = await app.request("/proxied");

        expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe("cross-origin");
        expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });
});
