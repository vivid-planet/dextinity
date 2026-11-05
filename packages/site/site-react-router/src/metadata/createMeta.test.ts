import { describe, expect, it } from "vitest";

import { createMeta } from "./createMeta";

describe("createMeta", () => {
    it("converts the metadata to meta descriptors with absolute URLs", () => {
        expect(
            createMeta(
                {
                    title: "About",
                    description: "About us",
                    robots: { index: false },
                    alternates: { canonical: "/en/about", languages: { de: "/de/ueber-uns" } },
                    openGraph: { title: "About", type: "website", url: "/en/about", images: ["/dam/og.jpg"] },
                },
                { baseUrl: "https://example.com" },
            ),
        ).toEqual([
            { title: "About" },
            { name: "description", content: "About us" },
            { name: "robots", content: "noindex, follow" },
            { tagName: "link", rel: "canonical", href: "https://example.com/en/about" },
            { tagName: "link", rel: "alternate", hrefLang: "de", href: "https://example.com/de/ueber-uns" },
            { property: "og:title", content: "About" },
            { property: "og:url", content: "https://example.com/en/about" },
            { property: "og:image", content: "https://example.com/dam/og.jpg" },
            { property: "og:type", content: "website" },
        ]);
    });

    it("leaves out what isn't set", () => {
        expect(createMeta({})).toEqual([]);
    });
});
