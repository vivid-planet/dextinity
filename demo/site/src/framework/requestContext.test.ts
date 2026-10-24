// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getCookie, getRequest, getSiteContext, getVisibility, isRscRequest, runWithRequestContext, setSiteContext } from "./requestContext";

function runWithRequest<T>(callback: () => T, { headers }: { headers?: HeadersInit } = {}) {
    return runWithRequestContext({ request: new Request("https://example.com/en", { headers }), isRscRequest: true }, callback);
}

describe("requestContext", () => {
    it("provides the request and whether it's an RSC request", () => {
        runWithRequest(() => {
            expect(getRequest().url).toBe("https://example.com/en");
            expect(isRscRequest()).toBe(true);
        });
    });

    it("keeps the context across asynchronous calls", async () => {
        const url = await runWithRequest(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1));
            return getRequest().url;
        });

        expect(url).toBe("https://example.com/en");
    });

    it("isolates concurrent requests", async () => {
        const urls = await Promise.all(
            ["https://example.com/a", "https://example.com/b"].map((url, index) =>
                runWithRequestContext({ request: new Request(url), isRscRequest: false }, async () => {
                    await new Promise((resolve) => setTimeout(resolve, 10 - index * 5));
                    return getRequest().url;
                }),
            ),
        );

        expect(urls).toEqual(["https://example.com/a", "https://example.com/b"]);
    });

    it("throws outside of a request", () => {
        expect(() => getRequest()).toThrow("Request context is only available while handling a request");
    });

    it("reads cookies of the request", () => {
        runWithRequest(
            () => {
                expect(getCookie("consent")).toBe("all");
                expect(getCookie("missing")).toBeUndefined();
            },
            { headers: { cookie: "session=abc; consent=all" } },
        );
    });

    it("provides the site context once it's set", () => {
        runWithRequest(() => {
            expect(() => getSiteContext()).toThrow("Site context is only available for site requests");
            expect(getVisibility()).toBe("default");

            setSiteContext({ domain: "main", visibility: "invisiblePages" });

            expect(getSiteContext()).toEqual({ domain: "main", visibility: "invisiblePages" });
            expect(getVisibility()).toBe("invisiblePages");
        });
    });

    it("falls back to the default visibility outside of a request", () => {
        expect(getVisibility()).toBe("default");
    });
});
