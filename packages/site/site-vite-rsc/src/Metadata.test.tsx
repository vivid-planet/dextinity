// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Metadata } from "./Metadata.js";

const baseUrl = "https://www.example.com";

describe("Metadata", () => {
    it("renders the robots and Open Graph type for a page without metadata", () => {
        expect(renderToStaticMarkup(<Metadata baseUrl={baseUrl} />)).toBe(
            '<meta name="robots" content="index"/><meta property="og:type" content="website"/>',
        );
    });

    it("renders the metadata of a page", () => {
        const html = renderToStaticMarkup(
            <Metadata
                baseUrl={baseUrl}
                description="Description"
                noIndex
                canonicalUrl="https://www.example.com/en/page"
                alternateLinks={[{ hrefLang: "de", url: "https://www.example.com/de/seite" }]}
                openGraphTitle="Open Graph title"
                openGraphDescription="Open Graph description"
                openGraphImageUrl="https://cdn.example.com/image.jpg"
                openGraphType="article"
            />,
        );

        expect(html).toBe(
            [
                '<meta name="description" content="Description"/>',
                '<meta name="robots" content="noindex"/>',
                '<link rel="canonical" href="https://www.example.com/en/page"/>',
                '<link rel="alternate" hrefLang="de" href="https://www.example.com/de/seite"/>',
                '<meta property="og:title" content="Open Graph title"/>',
                '<meta property="og:description" content="Open Graph description"/>',
                '<meta property="og:url" content="https://www.example.com/en/page"/>',
                '<meta property="og:image" content="https://cdn.example.com/image.jpg"/>',
                '<meta property="og:type" content="article"/>',
            ].join(""),
        );
    });

    it("resolves relative URLs against the base URL", () => {
        const html = renderToStaticMarkup(
            <Metadata
                baseUrl={baseUrl}
                canonicalUrl="/en/page"
                alternateLinks={[{ hrefLang: "de", url: "/de/seite" }]}
                openGraphImageUrl="/dam/images/image.jpg"
            />,
        );

        expect(html).toContain('<link rel="canonical" href="https://www.example.com/en/page"/>');
        expect(html).toContain('<link rel="alternate" hrefLang="de" href="https://www.example.com/de/seite"/>');
        expect(html).toContain('<meta property="og:url" content="https://www.example.com/en/page"/>');
        expect(html).toContain('<meta property="og:image" content="https://www.example.com/dam/images/image.jpg"/>');
    });

    it("keeps absolute URLs unchanged, also without a trailing slash", () => {
        const html = renderToStaticMarkup(<Metadata baseUrl={baseUrl} canonicalUrl="https://www.example.com" />);

        expect(html).toContain('<link rel="canonical" href="https://www.example.com"/>');
    });
});
