// @vitest-environment node
import { describe, expect, it } from "vitest";

import { robotsResponse, sitemapResponse } from "./metadataRoutes.js";

describe("sitemapResponse", () => {
    it("renders the pages of the sitemap", async () => {
        const response = sitemapResponse([
            { url: "https://www.example.com/en", lastModified: new Date("2026-10-01T12:00:00Z"), changeFrequency: "daily", priority: 1 },
            { url: "https://www.example.com/en/a&b", lastModified: "2026-10-02" },
        ]);

        expect(response.headers.get("content-type")).toBe("application/xml");
        expect(response.headers.get("cache-control")).toBe("public, max-age=900");
        expect(await response.text()).toBe(
            [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                "<url>",
                "<loc>https://www.example.com/en</loc>",
                "<lastmod>2026-10-01T12:00:00.000Z</lastmod>",
                "<changefreq>daily</changefreq>",
                "<priority>1</priority>",
                "</url>",
                "<url>",
                "<loc>https://www.example.com/en/a&amp;b</loc>",
                "<lastmod>2026-10-02</lastmod>",
                "</url>",
                "</urlset>",
                "",
            ].join("\n"),
        );
    });

    it("renders alternate languages, images and videos with their namespaces", async () => {
        const xml = await sitemapResponse([
            {
                url: "https://www.example.com/en",
                alternates: { languages: { de: "https://www.example.com/de" } },
                images: ["https://www.example.com/image.jpg"],
                videos: [{ title: "Video", thumbnail_loc: "https://www.example.com/thumbnail.jpg", description: "A <video>", duration: 60 }],
            },
        ]).text();

        expect(xml).toContain(
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        );
        expect(xml).toContain('<xhtml:link rel="alternate" hreflang="de" href="https://www.example.com/de" />');
        expect(xml).toContain("<image:image>\n<image:loc>https://www.example.com/image.jpg</image:loc>\n</image:image>");
        expect(xml).toContain("<video:description>A &lt;video&gt;</video:description>\n<video:duration>60</video:duration>\n</video:video>");
    });

    it("uses the given cache control", () => {
        expect(sitemapResponse([], { cacheControl: "no-store" }).headers.get("cache-control")).toBe("no-store");
    });
});

describe("robotsResponse", () => {
    it("renders the rules and the sitemap", async () => {
        const response = robotsResponse({ rules: { userAgent: "*", allow: "/" }, sitemap: "https://www.example.com/sitemap.xml" });

        expect(response.headers.get("content-type")).toBe("text/plain; charset=UTF-8");
        expect(await response.text()).toBe("User-Agent: *\nAllow: /\n\nSitemap: https://www.example.com/sitemap.xml\n");
    });

    it("renders several rules", async () => {
        const text = await robotsResponse({
            rules: [
                { userAgent: ["Googlebot", "Bingbot"], disallow: ["/private", "/tmp"], crawlDelay: 2 },
                { userAgent: "*", allow: "/", other: { "Clean-param": ["ref /articles/", "utm_source /"] } },
            ],
            host: "www.example.com",
        }).text();

        expect(text).toBe(
            "User-Agent: Googlebot\nUser-Agent: Bingbot\nDisallow: /private\nDisallow: /tmp\nCrawl-delay: 2\n\n" +
                "User-Agent: *\nAllow: /\nClean-param: ref /articles/\nClean-param: utm_source /\n\nHost: www.example.com\n",
        );
    });
});
