// @vitest-environment node
import { previewContext } from "@dextinity/site-react-router/server";
import { getSiteContext, hasSiteContext } from "@src/util/siteContext";
import { RouterContextProvider } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { siteContextMiddleware } from "./siteContext";

const siteConfigs = [
    { scope: { domain: "main", languages: ["en"] }, domains: { main: "www.example.com" }, url: "https://www.example.com" },
    { scope: { domain: "secondary", languages: ["en"] }, domains: { main: "secondary.example.com" }, url: "https://secondary.example.com" },
];

async function requestSiteContext({ host, previewScope }: { host: string; previewScope?: { domain: string } }) {
    const context = new RouterContextProvider();
    if (previewScope) {
        context.set(previewContext, { visibility: "invisiblePages", sitePreview: {}, scope: previewScope });
    }
    const request = new Request("https://www.example.com/en", { headers: { host } });
    await siteContextMiddleware({ request, context, params: {} } as never, async () => new Response());
    return hasSiteContext(context) ? getSiteContext(context).domain : null;
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
