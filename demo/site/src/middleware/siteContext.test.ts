// @vitest-environment node
import { runWithRequestContext } from "@dextinity/site-vite-rsc/server";
import { getSiteContext, hasSiteContext } from "@src/util/siteContext";
import { createSitePreviewJwt, sitePreviewCookieName } from "@src/util/sitePreview";
import { Hono } from "hono";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { siteContextMiddleware } from "./siteContext";

const siteConfigs = [
    { scope: { domain: "main", languages: ["en"] }, domains: { main: "www.example.com" }, url: "https://www.example.com" },
    { scope: { domain: "secondary", languages: ["en"] }, domains: { main: "secondary.example.com" }, url: "https://secondary.example.com" },
];

const app = new Hono();
app.use(siteContextMiddleware);
app.get("*", (c) => c.json(hasSiteContext() ? getSiteContext() : null));

async function requestSiteContext(headers: Record<string, string>) {
    const request = new Request("https://www.example.com/en", { headers });
    const response = await runWithRequestContext({ request, isRscRequest: false }, () => app.fetch(request));
    return response.json();
}

function createJwt({ domain = "main", includeInvisible }: { domain?: string; includeInvisible: boolean }) {
    return createSitePreviewJwt({ scope: { domain, language: "en" }, previewData: { includeInvisible }, userId: "user" });
}

describe("siteContextMiddleware", () => {
    beforeAll(() => {
        vi.stubEnv("PUBLIC_SITE_CONFIGS", btoa(JSON.stringify(siteConfigs)));
        vi.stubEnv("SITE_PREVIEW_SECRET", "secret");
    });

    it("resolves the site by the host", async () => {
        expect(await requestSiteContext({ host: "secondary.example.com" })).toEqual({ domain: "secondary", visibility: "default" });
    });

    it("leaves the site context unset for unknown hosts", async () => {
        expect(await requestSiteContext({ host: "unknown.example.com" })).toBeNull();
    });

    it("resolves the site by the scope of the site preview and marks the request as site preview", async () => {
        const cookie = `${sitePreviewCookieName}=${await createJwt({ domain: "secondary", includeInvisible: false })}`;

        expect(await requestSiteContext({ host: "preview.example.com", cookie })).toEqual({
            domain: "secondary",
            visibility: "invisiblePages",
            sitePreview: expect.objectContaining({ previewData: { includeInvisible: false } }),
        });
    });

    it("only sets the visibility for the block preview header", async () => {
        const blockPreview = await createJwt({ includeInvisible: true });

        expect(await requestSiteContext({ host: "www.example.com", "x-block-preview": blockPreview })).toEqual({
            domain: "main",
            visibility: "invisibleBlocks",
        });
    });

    it("takes the visibility from the block preview header and the site preview from the cookie", async () => {
        const blockPreview = await createJwt({ includeInvisible: true });
        const cookie = `${sitePreviewCookieName}=${await createJwt({ includeInvisible: false })}`;

        expect(await requestSiteContext({ host: "www.example.com", "x-block-preview": blockPreview, cookie })).toEqual({
            domain: "main",
            visibility: "invisibleBlocks",
            sitePreview: expect.objectContaining({ previewData: { includeInvisible: false } }),
        });
    });

    it("ignores invalid previews", async () => {
        expect(await requestSiteContext({ host: "www.example.com", cookie: `${sitePreviewCookieName}=invalid` })).toEqual({
            domain: "main",
            visibility: "default",
        });
    });
});
