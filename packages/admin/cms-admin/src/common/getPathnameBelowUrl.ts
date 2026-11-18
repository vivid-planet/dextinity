/**
 * Decodes a segment of a URL path, keeping a malformed segment as it is.
 */
export function decodePathSegment(segment: string): string {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}

function splitPathname(pathname: string): string[] {
    const segments = pathname.split("/").slice(1);
    return segments[segments.length - 1] === "" ? segments.slice(0, -1) : segments;
}

function isSameSegment(segment: string, otherSegment: string) {
    return decodePathSegment(segment).toLowerCase() === decodePathSegment(otherSegment).toLowerCase();
}

/**
 * Returns the part of `pathname` below `url`, e.g. `/settings` for `/main/en/settings` below `/main/en`, `""` if `pathname` is `url` itself,
 * or `null` if it's neither.
 *
 * The segments are compared decoded and case-insensitively, like React Router matches routes, because the location and the URLs of routes
 * may be encoded differently: the location keeps the encoding of the URL that was opened, while React Router re-encodes the URLs of
 * its routes in browser history and keeps them decoded in memory history.
 */
export function getPathnameBelowUrl(pathname: string, url: string): string | null {
    const urlSegments = splitPathname(url);
    const pathnameSegments = splitPathname(pathname);
    if (pathnameSegments.length < urlSegments.length || !urlSegments.every((segment, index) => isSameSegment(segment, pathnameSegments[index]))) {
        return null;
    }
    return pathnameSegments
        .slice(urlSegments.length)
        .map((segment) => `/${segment}`)
        .join("");
}
