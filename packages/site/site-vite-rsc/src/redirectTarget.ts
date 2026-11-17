const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];

// Relative targets resolve to the http(s) URL of the page
const relativeBase = "http://relative.invalid";

/**
 * Only allows targets the browser can safely navigate to, e.g. no `javascript:` URLs from redirect entries of the CMS
 */
export function isAllowedRedirectTarget(location: string): boolean {
    return URL.canParse(location, relativeBase) && allowedProtocols.includes(new URL(location, relativeBase).protocol);
}

/**
 * The URL a client navigation to `pageUrl` continues with, like the browser for HTTP redirects: relative to the page and
 * keeping its fragment unless the target has its own
 */
export function resolveRedirectTarget(location: string, pageUrl: URL): URL | undefined {
    if (!isAllowedRedirectTarget(location)) {
        return undefined;
    }
    const target = new URL(location, pageUrl);
    if (!target.hash && (target.protocol === "http:" || target.protocol === "https:")) {
        target.hash = pageUrl.hash;
    }
    return target;
}
