// @vitest-environment node
import { runWithRequestContext } from "@dextinity/site-vite-rsc/server";
import { setSiteContext } from "@src/util/siteContext";
import { describe, expect, it, vi } from "vitest";

import { absoluteUrl } from "./absoluteUrl";

vi.mock("./siteConfig", () => ({
    getSiteConfigForDomain: (domain: string) => ({ url: domain === "main" ? "https://www.example.com" : "https://secondary.example.com" }),
}));

function runForDomain<T>(domain: string, callback: () => T) {
    return runWithRequestContext({ request: new Request("http://localhost:3000/en"), isRscRequest: false }, () => {
        setSiteContext({ domain, visibility: "default" });
        return callback();
    });
}

describe("absoluteUrl", () => {
    it("resolves relative URLs against the URL of the current site", () => {
        expect(runForDomain("main", () => absoluteUrl("/dam/images/hash/image.jpg"))).toBe("https://www.example.com/dam/images/hash/image.jpg");
        expect(runForDomain("secondary", () => absoluteUrl("/en/news?page=2"))).toBe("https://secondary.example.com/en/news?page=2");
    });

    it("returns absolute URLs unchanged", () => {
        expect(runForDomain("main", () => absoluteUrl("https://cdn.example.org/image.jpg"))).toBe("https://cdn.example.org/image.jpg");
    });
});
