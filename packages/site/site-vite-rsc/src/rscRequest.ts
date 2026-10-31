// RSC requests are distinguished from HTML requests by a pathname prefix (instead of a header) so that CDNs cache them separately
const rscPathnamePrefix = "/_rsc";

export function addRscPrefix(pathname: string) {
    return `${rscPathnamePrefix}${pathname}`;
}

export function createRscUrl(href: string) {
    const url = new URL(href, window.location.href);
    url.pathname = addRscPrefix(url.pathname);
    url.hash = "";
    return url;
}

export function stripRscPrefix(url: URL) {
    if (url.pathname !== rscPathnamePrefix && !url.pathname.startsWith(`${rscPathnamePrefix}/`)) {
        return null;
    }
    const strippedUrl = new URL(url);
    strippedUrl.pathname = url.pathname.slice(rscPathnamePrefix.length) || "/";
    return strippedUrl;
}

/**
 * The page URL of a redirected RSC response. `response.url` never contains a fragment, browsers keep the requested one
 * across redirects.
 */
export function getRedirectedPageUrl(responseUrl: string, requestedUrl: URL) {
    const redirectedUrl = stripRscPrefix(new URL(responseUrl));
    if (redirectedUrl) {
        redirectedUrl.hash = requestedUrl.hash;
    }
    return redirectedUrl;
}
