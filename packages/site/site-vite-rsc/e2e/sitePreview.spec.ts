import { expect, test } from "@playwright/test";

test("renders the page, the not found page and the error page as site preview", async ({ request }) => {
    for (const path of ["/", "/not-found", "/server-error"]) {
        expect(await (await request.get(`${path}?sitePreview`)).text()).toContain("Preview type: SitePreview");
    }
});

test("renders pages without site preview by default", async ({ request }) => {
    expect(await (await request.get("/")).text()).toContain("Preview type: NoPreview");
});
