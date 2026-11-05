import { SignJWT } from "jose";

import { expect, test } from "./browserTest";

const secret = new TextEncoder().encode("e2e-site-preview-secret-with-enough-length");

function createJwt(payload: Record<string, unknown>) {
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1 hour").sign(secret);
}

test("starts the site preview and tells the admin the location of the page", async ({ page, goto }) => {
    await page.addInitScript(() => {
        const messages: unknown[] = [];
        Object.assign(window, { previewMessages: messages });
        window.addEventListener("message", (event) => messages.push(JSON.parse(event.data)));
    });
    const jwt = await createJwt({
        scope: { domain: "main", language: "en" },
        previewData: { includeInvisible: false },
        userId: "e2e",
        path: "/preview-info",
    });

    await goto(`/site-preview?jwt=${jwt}`);

    await expect(page).toHaveURL("/preview-info");
    await expect(page.locator("#preview-info")).toHaveText('Preview of {"domain":"main","language":"en"}');
    await expect
        .poll(() => page.evaluate(() => (window as unknown as { previewMessages: unknown[] }).previewMessages))
        .toContainEqual({ dextinityType: "SitePreviewLocation", data: { pathname: "/preview-info", search: "" } });
});

test("rejects an invalid JWT", async ({ request }) => {
    const response = await request.get("/site-preview?jwt=invalid");

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: "JWT-validation failed." });
});

test("doesn't show the preview without the cookie", async ({ page, goto }) => {
    await goto("/preview-info");

    await expect(page.locator("#preview-info")).toHaveText("No preview");
});
