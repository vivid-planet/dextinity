import { noStoreCacheControl } from "./cacheControl.js";
import { getVisibility } from "./requestContext.js";

const defaultCacheControl = "public, max-age=900";

type SitemapVideo = {
    title: string;
    thumbnail_loc: string;
    description: string;
    content_loc?: string;
    player_loc?: string;
    duration?: number;
    expiration_date?: Date | string;
    rating?: number;
    view_count?: number;
    publication_date?: Date | string;
    family_friendly?: "yes" | "no";
    restriction?: { relationship: "allow" | "deny"; content: string };
    platform?: { relationship: "allow" | "deny"; content: string };
    requires_subscription?: "yes" | "no";
    uploader?: { info?: string; content?: string };
    live?: "yes" | "no";
    tag?: string;
};

/** Same as `MetadataRoute.Sitemap` of Next.js */
export type Sitemap = Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
    /** URLs of the page in other languages, by hreflang */
    alternates?: { languages?: Record<string, string | undefined> };
    images?: string[];
    videos?: SitemapVideo[];
}>;

type RobotsRule = {
    allow?: string | string[];
    disallow?: string | string[];
    crawlDelay?: number;
    /** Non-standard directives, e.g. `{ "Clean-param": "ref /articles/" }` */
    other?: Record<string, string | number | Array<string | number>>;
};

/** Same as `MetadataRoute.Robots` of Next.js */
export type Robots = {
    rules: (RobotsRule & { userAgent?: string | string[] }) | Array<RobotsRule & { userAgent: string | string[] }>;
    sitemap?: string | string[];
    host?: string;
};

function toArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

function escapeXml(value: string | number | Date) {
    const text = value instanceof Date ? value.toISOString() : String(value);
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function renderVideo(video: SitemapVideo) {
    const optionalFields = (
        ["content_loc", "player_loc", "duration", "view_count", "tag", "rating", "expiration_date", "publication_date"] as const
    ).flatMap((field) => {
        const value = video[field];
        return value !== undefined ? [`<video:${field}>${escapeXml(value)}</video:${field}>`] : [];
    });
    const flags = (["family_friendly", "requires_subscription", "live"] as const).flatMap((field) => {
        const value = video[field];
        return value !== undefined ? [`<video:${field}>${value}</video:${field}>`] : [];
    });
    const relations = (["restriction", "platform"] as const).flatMap((field) => {
        const value = video[field];
        return value !== undefined ? [`<video:${field} relationship="${value.relationship}">${escapeXml(value.content)}</video:${field}>`] : [];
    });
    const uploader = video.uploader
        ? [
              `<video:uploader${video.uploader.info ? ` info="${escapeXml(video.uploader.info)}"` : ""}>${escapeXml(video.uploader.content ?? "")}</video:uploader>`,
          ]
        : [];

    return [
        "<video:video>",
        `<video:title>${escapeXml(video.title)}</video:title>`,
        `<video:thumbnail_loc>${escapeXml(video.thumbnail_loc)}</video:thumbnail_loc>`,
        `<video:description>${escapeXml(video.description)}</video:description>`,
        ...optionalFields,
        ...flags,
        ...relations,
        ...uploader,
        "</video:video>\n",
    ].join("\n");
}

function renderSitemap(sitemap: Sitemap): string {
    const hasAlternates = sitemap.some((entry) => Object.keys(entry.alternates?.languages ?? {}).length > 0);
    const hasImages = sitemap.some((entry) => entry.images?.length);
    const hasVideos = sitemap.some((entry) => entry.videos?.length);

    let content = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
    if (hasImages) {
        content += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
    }
    if (hasVideos) {
        content += ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"';
    }
    if (hasAlternates) {
        content += ' xmlns:xhtml="http://www.w3.org/1999/xhtml"';
    }
    content += ">\n";

    for (const entry of sitemap) {
        content += `<url>\n<loc>${escapeXml(entry.url)}</loc>\n`;
        for (const [language, url] of Object.entries(entry.alternates?.languages ?? {})) {
            if (url) {
                content += `<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(url)}" />\n`;
            }
        }
        for (const image of entry.images ?? []) {
            content += `<image:image>\n<image:loc>${escapeXml(image)}</image:loc>\n</image:image>\n`;
        }
        for (const video of entry.videos ?? []) {
            content += renderVideo(video);
        }
        if (entry.lastModified) {
            content += `<lastmod>${escapeXml(entry.lastModified)}</lastmod>\n`;
        }
        if (entry.changeFrequency) {
            content += `<changefreq>${entry.changeFrequency}</changefreq>\n`;
        }
        if (typeof entry.priority === "number") {
            content += `<priority>${entry.priority}</priority>\n`;
        }
        content += "</url>\n";
    }

    return `${content}</urlset>\n`;
}

function renderRobots({ rules, sitemap, host }: Robots): string {
    let content = "";
    for (const rule of toArray(rules)) {
        for (const userAgent of toArray(rule.userAgent ?? "*")) {
            content += `User-Agent: ${userAgent}\n`;
        }
        for (const allow of rule.allow !== undefined ? toArray(rule.allow) : []) {
            content += `Allow: ${allow}\n`;
        }
        for (const disallow of rule.disallow !== undefined ? toArray(rule.disallow) : []) {
            content += `Disallow: ${disallow}\n`;
        }
        if (rule.crawlDelay) {
            content += `Crawl-delay: ${rule.crawlDelay}\n`;
        }
        for (const [key, value] of Object.entries(rule.other ?? {})) {
            for (const item of toArray(value)) {
                content += `${key}: ${item}\n`;
            }
        }
        content += "\n";
    }
    if (host) {
        content += `Host: ${host}\n`;
    }
    for (const url of sitemap !== undefined ? toArray(sitemap) : []) {
        content += `Sitemap: ${url}\n`;
    }
    return content;
}

/**
 * Renders the `sitemap.xml` of the site, like a `sitemap.ts` of Next.js. In a preview, it isn't cached, as it may contain unpublished pages.
 */
export function sitemapResponse(sitemap: Sitemap, { cacheControl = defaultCacheControl }: { cacheControl?: string } = {}): Response {
    const usedCacheControl = getVisibility() === "default" ? cacheControl : noStoreCacheControl;
    return new Response(renderSitemap(sitemap), { headers: { "Content-Type": "application/xml", "Cache-Control": usedCacheControl } });
}

/**
 * Renders the `robots.txt` of the site, like a `robots.ts` of Next.js
 */
export function robotsResponse(robots: Robots, { cacheControl = defaultCacheControl }: { cacheControl?: string } = {}): Response {
    return new Response(renderRobots(robots), { headers: { "Content-Type": "text/plain; charset=UTF-8", "Cache-Control": cacheControl } });
}
