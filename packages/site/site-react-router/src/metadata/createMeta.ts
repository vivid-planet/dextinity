import type { MetaDescriptor } from "react-router";

/**
 * The metadata of a page, a subset of the `Metadata` of Next.js
 */
export type Metadata = {
    title?: string;
    description?: string;
    robots?: { index?: boolean; follow?: boolean };
    alternates?: {
        canonical?: string;
        /** The URLs of the page in other languages, by their language code (`hreflang`) */
        languages?: Record<string, string>;
    };
    openGraph?: {
        title?: string;
        description?: string;
        type?: string;
        url?: string;
        images?: Array<string | { url: string; width?: number; height?: number; alt?: string }>;
    };
};

/**
 * Converts the metadata of a page to the `meta` of a React Router route, the counterpart of `generateMetadata` of Next.js.
 * Relative URLs are resolved against `baseUrl` (the `metadataBase` of Next.js).
 *
 * @example
 * export const meta: Route.MetaFunction = ({ loaderData }) => createMeta(loaderData.metadata, { baseUrl: loaderData.siteUrl });
 */
export function createMeta(metadata: Metadata, { baseUrl }: { baseUrl?: string } = {}): MetaDescriptor[] {
    const toAbsoluteUrl = (url: string) => (baseUrl ? new URL(url, baseUrl).toString() : url);
    const meta: MetaDescriptor[] = [];

    if (metadata.title !== undefined) {
        meta.push({ title: metadata.title });
    }
    if (metadata.description) {
        meta.push({ name: "description", content: metadata.description });
    }
    if (metadata.robots) {
        const { index = true, follow = true } = metadata.robots;
        meta.push({ name: "robots", content: `${index ? "index" : "noindex"}, ${follow ? "follow" : "nofollow"}` });
    }
    if (metadata.alternates?.canonical) {
        meta.push({ tagName: "link", rel: "canonical", href: toAbsoluteUrl(metadata.alternates.canonical) });
    }
    for (const [language, url] of Object.entries(metadata.alternates?.languages ?? {})) {
        meta.push({ tagName: "link", rel: "alternate", hrefLang: language, href: toAbsoluteUrl(url) });
    }

    const openGraph = metadata.openGraph;
    if (openGraph) {
        if (openGraph.title) {
            meta.push({ property: "og:title", content: openGraph.title });
        }
        if (openGraph.description) {
            meta.push({ property: "og:description", content: openGraph.description });
        }
        if (openGraph.url) {
            meta.push({ property: "og:url", content: toAbsoluteUrl(openGraph.url) });
        }
        for (const image of openGraph.images ?? []) {
            const { url, width, height, alt } = typeof image === "string" ? { url: image } : image;
            meta.push({ property: "og:image", content: toAbsoluteUrl(url) });
            if (width) {
                meta.push({ property: "og:image:width", content: String(width) });
            }
            if (height) {
                meta.push({ property: "og:image:height", content: String(height) });
            }
            if (alt) {
                meta.push({ property: "og:image:alt", content: alt });
            }
        }
        if (openGraph.type) {
            meta.push({ property: "og:type", content: openGraph.type });
        }
    }

    return meta;
}
