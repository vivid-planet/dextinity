// @vitest-environment node
import { Hono } from "hono";
import { SignJWT } from "jose";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { getPreviewScope, getSitePreview, getVisibility, runWithRequestContext } from "./requestContext.js";
import { createSitePreviewJwt, sitePreviewCookieName, sitePreviewMiddleware, sitePreviewRoute } from "./sitePreview.js";

const app = new Hono();
app.get("/site-preview", sitePreviewRoute);
app.use(sitePreviewMiddleware);
app.get("*", (c) => c.json({ visibility: getVisibility(), sitePreview: getSitePreview() ?? null, scope: getPreviewScope() ?? null }));

async function request(path: string, headers: Record<string, string> = {}) {
    const request = new Request(`https://www.example.com${path}`, { headers });
    return runWithRequestContext({ request, isRscRequest: false }, () => app.fetch(request));
}

async function requestPreview(headers: Record<string, string>) {
    return (await request("/en", headers)).json();
}

function createJwt({ domain = "main", includeInvisible }: { domain?: string; includeInvisible: boolean }) {
    return createSitePreviewJwt({ scope: { domain, language: "en" }, previewData: { includeInvisible }, userId: "user" });
}

async function createApiJwt(payload: Record<string, unknown>, secret = "secret") {
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("10 seconds").sign(new TextEncoder().encode(secret));
}

beforeAll(() => {
    vi.stubEnv("SITE_PREVIEW_SECRET", "secret");
});

afterAll(() => {
    vi.unstubAllEnvs();
});

describe("sitePreviewMiddleware", () => {
    it("sets no preview without header and cookie", async () => {
        expect(await requestPreview({})).toEqual({ visibility: "default", sitePreview: null, scope: null });
    });

    it.each([
        [false, "invisiblePages"],
        [true, "invisibleBlocks"],
    ])("sets the site preview from the cookie, including invisible blocks: %s", async (includeInvisible, visibility) => {
        const cookie = `${sitePreviewCookieName}=${await createJwt({ domain: "secondary", includeInvisible })}`;

        expect(await requestPreview({ cookie })).toEqual({
            visibility,
            sitePreview: { previewData: { includeInvisible } },
            scope: { domain: "secondary", language: "en" },
        });
    });

    it("only sets the visibility and the scope for the block preview header", async () => {
        expect(await requestPreview({ "x-block-preview": await createJwt({ includeInvisible: true }) })).toEqual({
            visibility: "invisibleBlocks",
            sitePreview: null,
            scope: { domain: "main", language: "en" },
        });
    });

    it("takes the visibility and the scope from the block preview header and the site preview from the cookie", async () => {
        const cookie = `${sitePreviewCookieName}=${await createJwt({ domain: "secondary", includeInvisible: false })}`;

        expect(await requestPreview({ "x-block-preview": await createJwt({ includeInvisible: true }), cookie })).toEqual({
            visibility: "invisibleBlocks",
            sitePreview: { previewData: { includeInvisible: false } },
            scope: { domain: "main", language: "en" },
        });
    });

    it("ignores invalid previews and previews signed with another secret", async () => {
        const otherSecretJwt = await createApiJwt({ scope: { domain: "main" }, previewData: { includeInvisible: true } }, "other");

        expect(await requestPreview({ cookie: `${sitePreviewCookieName}=invalid`, "x-block-preview": otherSecretJwt })).toEqual({
            visibility: "default",
            sitePreview: null,
            scope: null,
        });
    });
});

describe("sitePreviewRoute", () => {
    const payload = { scope: { domain: "main", language: "en" }, previewData: { includeInvisible: false }, userId: "user", path: "/en/page?a=1" };

    it("stores the preview in a cookie and redirects to the path", async () => {
        const response = await request(`/site-preview?jwt=${await createApiJwt(payload)}`);

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("/en/page?a=1");
        const cookie = response.headers.get("set-cookie") ?? "";
        expect(cookie).toMatch(new RegExp(`^${sitePreviewCookieName}=ey`));
        expect(cookie).toContain("HttpOnly");
        expect(cookie).toContain("SameSite=Lax");

        expect(await requestPreview({ cookie: cookie.split(";")[0] })).toEqual({
            visibility: "invisiblePages",
            sitePreview: { previewData: { includeInvisible: false } },
            scope: { domain: "main", language: "en" },
        });
    });

    it.each(["https://evil.example.com/", "//evil.example.com/"])("refuses to redirect to %s", async (path) => {
        const response = await request(`/site-preview?jwt=${await createApiJwt({ ...payload, path })}`);

        expect(response.status).toBe(400);
        expect(response.headers.get("set-cookie")).toBeNull();
    });

    it("refuses a missing or invalid JWT", async () => {
        expect((await request("/site-preview")).status).toBe(400);
        expect((await request(`/site-preview?jwt=${await createApiJwt(payload, "other")}`)).status).toBe(400);
    });
});
