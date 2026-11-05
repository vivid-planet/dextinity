import { describe, expect, it } from "vitest";

import { withSecurityHeaders } from "./securityHeaders";

describe("withSecurityHeaders", () => {
    it("adds the security headers", () => {
        const response = withSecurityHeaders(new Response("ok"));
        expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    });

    it("keeps the headers of the response", () => {
        const response = withSecurityHeaders(new Response("ok", { headers: { "Cross-Origin-Resource-Policy": "cross-origin" } }));
        expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe("cross-origin");
    });
});
