import type { MetaDescriptor } from "react-router";

type MetadataOptions = {
    title: string;
    /** Relative URLs are resolved against it, e.g. the URL of the site, as crawlers and share previews need absolute URLs */
    baseUrl: string;
    description?: string;
    noIndex?: boolean;
    /** Also used as `og:url` */
    canonicalUrl?: string;
    alternateLinks?: Array<{ hrefLang: string; url: string }>;
    openGraphTitle?: string;
    openGraphDescription?: string;
    openGraphImageUrl?: string;
    /** Defaults to `website` */
    openGraphType?: string;
};

const urlWithSchemeRegex = /^[a-z][a-z\d+.-]*:/i;

function resolveUrl(url: string, baseUrl: string) {
    return urlWithSchemeRegex.test(url) ? url : new URL(url, baseUrl).href;
}

/**
 * Creates the title, description, robots, canonical, alternate and Open Graph tags of a page for the `meta` export of its route,
 * named like the fields of the CMS SEO block
 *
 * @example
 * export const meta: Route.MetaFunction = ({ loaderData }) => createMetadata({ title: loaderData.title, baseUrl: loaderData.siteUrl });
 */
export function createMetadata({
    title,
    baseUrl,
    description,
    noIndex,
    canonicalUrl,
    alternateLinks = [],
    openGraphTitle,
    openGraphDescription,
    openGraphImageUrl,
    openGraphType = "website",
}: MetadataOptions): MetaDescriptor[] {
    const metadata: MetaDescriptor[] = [{ title }];
    if (description) {
        metadata.push({ name: "description", content: description });
    }
    metadata.push({ name: "robots", content: noIndex ? "noindex" : "index" });
    if (canonicalUrl) {
        metadata.push({ tagName: "link", rel: "canonical", href: resolveUrl(canonicalUrl, baseUrl) });
    }
    for (const link of alternateLinks) {
        metadata.push({ tagName: "link", rel: "alternate", hrefLang: link.hrefLang, href: resolveUrl(link.url, baseUrl) });
    }
    if (openGraphTitle) {
        metadata.push({ property: "og:title", content: openGraphTitle });
    }
    if (openGraphDescription) {
        metadata.push({ property: "og:description", content: openGraphDescription });
    }
    if (canonicalUrl) {
        metadata.push({ property: "og:url", content: resolveUrl(canonicalUrl, baseUrl) });
    }
    if (openGraphImageUrl) {
        metadata.push({ property: "og:image", content: resolveUrl(openGraphImageUrl, baseUrl) });
    }
    metadata.push({ property: "og:type", content: openGraphType });
    return metadata;
}
