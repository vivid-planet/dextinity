// @vitest-environment node
import { SignJWT } from "jose";
import { beforeEach, describe, expect, it } from "vitest";

import { previewParams, sitePreviewRoute } from "./previewParams";

const secret = "test-secret-with-enough-length-for-hs256";

async function createJwt(payload: Record<string, unknown>, key = secret) {
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1 hour").sign(new TextEncoder().encode(key));
}

function getCookieOf(response: Response) {
    return response.headers.get("Set-Cookie")?.split(";")[0] ?? "";
}

describe("sitePreviewRoute", () => {
    beforeEach(() => {
        process.env.SITE_PREVIEW_SECRET = secret;
    });

    it("stores the preview parameters in a cookie and redirects to the path", async () => {
        const jwt = await createJwt({
            scope: { domain: "main", language: "en" },
            previewData: { includeInvisible: true },
            userId: "u1",
            path: "/en/about",
        });

        const response = await sitePreviewRoute(new Request(`http://localhost/site-preview?jwt=${jwt}`));

        expect(response.status).toBe(307);
        expect(response.headers.get("Location")).toBe("/en/about");
        expect(response.headers.get("Set-Cookie")).toContain("HttpOnly");
        const params = await previewParams(new Request("http://localhost/en/about", { headers: { cookie: getCookieOf(response) } }));
        expect(params).toMatchObject({ scope: { domain: "main", language: "en" }, previewData: { includeInvisible: true }, userId: "u1" });
    });

    it("rejects a JWT with another secret", async () => {
        const jwt = await createJwt({ scope: {}, userId: "u1", path: "/" }, "another-secret-with-enough-length-for-hs256");

        const response = await sitePreviewRoute(new Request(`http://localhost/site-preview?jwt=${jwt}`));

        expect(response.status).toBe(400);
    });

    it("rejects redirects to other hosts", async () => {
        const jwt = await createJwt({ scope: {}, userId: "u1", path: "//evil.example" });

        const response = await sitePreviewRoute(new Request(`http://localhost/site-preview?jwt=${jwt}`));

        expect(response.status).toBe(400);
    });
});

describe("previewParams", () => {
    beforeEach(() => {
        process.env.SITE_PREVIEW_SECRET = secret;
    });

    it("returns null without the cookie", async () => {
        expect(await previewParams(new Request("http://localhost/"))).toBeNull();
    });

    it("returns null for a forged cookie", async () => {
        const jwt = await createJwt({ scope: {}, userId: "u1" }, "another-secret-with-enough-length-for-hs256");
        expect(await previewParams(new Request("http://localhost/", { headers: { cookie: `__dextinity_site_preview=${jwt}` } }))).toBeNull();
    });
});
