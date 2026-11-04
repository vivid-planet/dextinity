import { describe, expect, it } from "vitest";

import { createMetadata } from "./metadata.js";

describe("createMetadata", () => {
    it("creates the tags of a page and resolves relative URLs against the base URL", () => {
        expect(
            createMetadata({
                title: "Page",
                baseUrl: "https://www.example.com",
                description: "Description",
                canonicalUrl: "/en/page",
                alternateLinks: [{ hrefLang: "de", url: "https://www.example.de/seite" }],
                openGraphTitle: "Open Graph title",
                openGraphDescription: "Open Graph description",
                openGraphImageUrl: "/dam/images/image.jpg",
            }),
        ).toEqual([
            { title: "Page" },
            { name: "description", content: "Description" },
            { name: "robots", content: "index" },
            { tagName: "link", rel: "canonical", href: "https://www.example.com/en/page" },
            { tagName: "link", rel: "alternate", hrefLang: "de", href: "https://www.example.de/seite" },
            { property: "og:title", content: "Open Graph title" },
            { property: "og:description", content: "Open Graph description" },
            { property: "og:url", content: "https://www.example.com/en/page" },
            { property: "og:image", content: "https://www.example.com/dam/images/image.jpg" },
            { property: "og:type", content: "website" },
        ]);
    });

    it("only creates the title, robots and type tags without other metadata", () => {
        expect(createMetadata({ title: "Page", baseUrl: "https://www.example.com", noIndex: true, openGraphType: "article" })).toEqual([
            { title: "Page" },
            { name: "robots", content: "noindex" },
            { property: "og:type", content: "article" },
        ]);
    });
});
