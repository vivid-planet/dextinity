// Search engines, link previews and archives, based on the HTML-limited bots of Next.js plus Googlebot and generic names
const botUserAgentPattern =
    /bot\b|crawl|spider|slurp|Googlebot|[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|DuckDuckBot|baiduspider|yandex|sogou|ia_archiver|BingPreview|facebookexternalhit|facebookcatalog|vkShare|quora link preview|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i;

/**
 * Bots get the complete page, with the status of `notFound()`, `redirect()` and errors anywhere in the page
 */
export function isBotUserAgent(userAgent: string | null) {
    return userAgent !== null && botUserAgentPattern.test(userAgent);
}
