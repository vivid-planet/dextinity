import { expect, test } from "@playwright/test";
import { SignJWT } from "jose";

const noStoreCacheControl = "private, no-cache, no-store, max-age=0, must-revalidate";

// Like the sitePreviewJwt resolver of the API, signed with the SITE_PREVIEW_SECRET of playwright.config.ts
function createApiJwt(path: string) {
    return new SignJWT({ scope: { domain: "main", language: "en" }, previewData: { includeInvisible: true }, userId: "user", path })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1 minute")
        .sign(new TextEncoder().encode("e2e-site-preview-secret"));
}

test("renders pages without site preview by default", async ({ request }) => {
    expect(await (await request.get("/")).text()).toContain("Preview type: <!-- -->NoPreview<!-- -->, visibility: <!-- -->default");
});

test("starts the site preview and renders the pages, the not found and the error pages as site preview", async ({ request }) => {
    const response = await request.get(`/site-preview?jwt=${await createApiJwt("/cached")}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toBe("/cached");
    expect(response.headers()["cache-control"]).toBe(noStoreCacheControl);

    // The request context keeps the cookie of the response
    for (const path of ["/", "/not-found", "/server-error"]) {
        expect(await (await request.get(path)).text()).toContain("Preview type: <!-- -->SitePreview<!-- -->, visibility: <!-- -->invisibleBlocks");
    }
});

test("doesn't cache the sitemap in the site preview", async ({ request }) => {
    await request.get(`/site-preview?jwt=${await createApiJwt("/")}`);

    expect((await request.get("/sitemap.xml")).headers()["cache-control"]).toBe(noStoreCacheControl);
});

test("refuses JWTs of another secret", async ({ request }) => {
    const jwt = await new SignJWT({ path: "/" }).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode("other"));

    expect((await request.get(`/site-preview?jwt=${jwt}`, { maxRedirects: 0 })).status()).toBe(400);
});
