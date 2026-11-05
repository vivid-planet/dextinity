// @vitest-environment node
import { describe, expect, it } from "vitest";

import { resolveRobots, resolveSitemap, sitemapResponse } from "./metadataRoutes";

describe("resolveRobots", () => {
    it("renders the rules and the sitemap like Next.js", () => {
        expect(resolveRobots({ rules: { userAgent: "*", allow: "/" }, sitemap: "https://example.com/sitemap.xml" })).toBe(
            "User-Agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n",
        );
    });
});

describe("resolveSitemap", () => {
    it("renders and escapes the entries", () => {
        expect(resolveSitemap([{ url: "https://example.com/en/a&b", lastModified: "2026-01-01", changeFrequency: "weekly", priority: 0.5 }])).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url>\n<loc>https://example.com/en/a&amp;b</loc>\n<lastmod>2026-01-01</lastmod>\n<changefreq>weekly</changefreq>\n<priority>0.5</priority>\n</url>\n</urlset>\n',
        );
    });

    it("renders the alternates of the languages", () => {
        expect(resolveSitemap([{ url: "https://example.com/en", alternates: { languages: { de: "https://example.com/de" } } }])).toContain(
            '<xhtml:link rel="alternate" hreflang="de" href="https://example.com/de" />',
        );
    });
});

describe("sitemapResponse", () => {
    it("responds with XML and the passed headers", () => {
        const response = sitemapResponse([], { headers: { "Cache-Control": "public, max-age=900" } });
        expect(response.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
        expect(response.headers.get("Cache-Control")).toBe("public, max-age=900");
    });
});
