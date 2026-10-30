// @vitest-environment node
import { runWithRequestContext, setPreview } from "@dextinity/site-vite-rsc/server";
import { getSiteContext, hasSiteContext } from "@src/util/siteContext";
import { Hono } from "hono";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { siteContextMiddleware } from "./siteContext";

const siteConfigs = [
    { scope: { domain: "main", languages: ["en"] }, domains: { main: "www.example.com" }, url: "https://www.example.com" },
    { scope: { domain: "secondary", languages: ["en"] }, domains: { main: "secondary.example.com" }, url: "https://secondary.example.com" },
];

async function requestSiteContext({ host, previewScope }: { host: string; previewScope?: { domain: string } }) {
    const app = new Hono();
    app.use(async (_c, next) => {
        if (previewScope) {
            setPreview({ visibility: "invisiblePages", sitePreview: {}, scope: previewScope });
        }
        await next();
    });
    app.use(siteContextMiddleware);
    app.get("*", (c) => c.json(hasSiteContext() ? getSiteContext().domain : null));

    const request = new Request("https://www.example.com/en", { headers: { host } });
    const response = await runWithRequestContext({ request, isRscRequest: false }, () => app.fetch(request));
    return response.json();
}

describe("siteContextMiddleware", () => {
    beforeAll(() => {
        vi.stubEnv("PUBLIC_SITE_CONFIGS", btoa(JSON.stringify(siteConfigs)));
    });

    it("resolves the site by the host", async () => {
        expect(await requestSiteContext({ host: "secondary.example.com" })).toBe("secondary");
    });

    it("leaves the site context unset for unknown hosts", async () => {
        expect(await requestSiteContext({ host: "unknown.example.com" })).toBeNull();
    });

    it("resolves the site by the scope of the preview", async () => {
        expect(await requestSiteContext({ host: "preview.example.com", previewScope: { domain: "secondary" } })).toBe("secondary");
    });

    it("falls back to the host for an unknown preview scope", async () => {
        expect(await requestSiteContext({ host: "www.example.com", previewScope: { domain: "unknown" } })).toBe("main");
    });
});
