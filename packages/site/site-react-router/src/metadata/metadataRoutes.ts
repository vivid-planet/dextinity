/**
 * The rules of a `robots.txt`, the `MetadataRoute.Robots` of Next.js
 */
export type Robots = {
    rules:
        | { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[]; crawlDelay?: number }
        | Array<{ userAgent: string | string[]; allow?: string | string[]; disallow?: string | string[]; crawlDelay?: number }>;
    sitemap?: string | string[];
    host?: string;
};

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

/**
 * The entries of a `sitemap.xml`, the `MetadataRoute.Sitemap` of Next.js
 */
export type Sitemap = Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?: ChangeFrequency;
    priority?: number;
    alternates?: { languages?: Record<string, string> };
}>;

const toArray = <T>(value: T | T[] | undefined): T[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

export function resolveRobots({ rules, sitemap, host }: Robots): string {
    let content = "";
    for (const rule of toArray(rules)) {
        for (const userAgent of toArray(rule.userAgent ?? "*")) {
            content += `User-Agent: ${userAgent}\n`;
        }
        for (const allow of toArray(rule.allow)) {
            content += `Allow: ${allow}\n`;
        }
        for (const disallow of toArray(rule.disallow)) {
            content += `Disallow: ${disallow}\n`;
        }
        if (rule.crawlDelay !== undefined) {
            content += `Crawl-delay: ${rule.crawlDelay}\n`;
        }
        content += "\n";
    }
    if (host) {
        content += `Host: ${host}\n`;
    }
    for (const sitemapUrl of toArray(sitemap)) {
        content += `Sitemap: ${sitemapUrl}\n`;
    }
    return content;
}

function escapeXml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function resolveSitemap(sitemap: Sitemap): string {
    const hasAlternates = sitemap.some((entry) => Object.keys(entry.alternates?.languages ?? {}).length > 0);
    let content = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${
        hasAlternates ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ""
    }>\n`;
    for (const entry of sitemap) {
        content += `<url>\n<loc>${escapeXml(entry.url)}</loc>\n`;
        for (const [language, url] of Object.entries(entry.alternates?.languages ?? {})) {
            content += `<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(url)}" />\n`;
        }
        if (entry.lastModified) {
            const lastModified = entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified;
            content += `<lastmod>${escapeXml(lastModified)}</lastmod>\n`;
        }
        if (entry.changeFrequency) {
            content += `<changefreq>${entry.changeFrequency}</changefreq>\n`;
        }
        if (typeof entry.priority === "number") {
            content += `<priority>${entry.priority}</priority>\n`;
        }
        content += "</url>\n";
    }
    content += "</urlset>\n";
    return content;
}

/**
 * The response of a `robots.txt` resource route, the counterpart of `robots.ts` of Next.js
 *
 * @example
 * export async function loader() {
 *     return robotsResponse({ rules: { userAgent: "*", allow: "/" }, sitemap: "https://example.com/sitemap.xml" });
 * }
 */
export function robotsResponse(robots: Robots, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "text/plain; charset=utf-8");
    return new Response(resolveRobots(robots), { ...init, headers });
}

/**
 * The response of a `sitemap.xml` resource route, the counterpart of `sitemap.ts` of Next.js
 */
export function sitemapResponse(sitemap: Sitemap, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/xml; charset=utf-8");
    return new Response(resolveSitemap(sitemap), { ...init, headers });
}
