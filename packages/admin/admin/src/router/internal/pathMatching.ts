import type { PathMatch } from "react-router";

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

export function removeDuplicateSlashes(path: string) {
    return path.replace(/\/{2,}/g, "/");
}

function removeTrailingSlashes(path: string) {
    return path.replace(/(.)\/+$/, "$1");
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Escaping "%" and "/" again keeps the segments apart and lets a single decodeURIComponent() restore the decoded segment, even a malformed one
function toComparableSegment(segment: string) {
    return decodePathSegment(segment).replace(/%/g, "%25").replace(/\//g, "%2F");
}

function toComparablePathname(pathname: string) {
    return pathname.split("/").map(toComparableSegment).join("/");
}

const paramSegmentRegExp = /^:([\w-]+)(\?)?(.*)$/;

/**
 * Compiles a pattern with the syntax of React Router's `matchPath()` to a regular expression matching a comparable pathname.
 * Its literals are comparable as well, so that they match regardless of their encoding.
 */
interface CompiledParam {
    name: string;
    isOptional: boolean;
}

function compileAbsolutePattern(pattern: string, end: boolean): { regExp: RegExp; params: CompiledParam[] } {
    const segments = removeDuplicateSlashes(pattern)
        .split("/")
        .filter((segment) => segment !== "");
    const hasSplat = segments[segments.length - 1] === "*";
    if (hasSplat) {
        segments.pop();
    }

    const params: CompiledParam[] = [];
    let source = segments.length === 0 ? "^/" : "^";
    for (const segment of segments) {
        const paramMatch = segment.match(paramSegmentRegExp);
        if (paramMatch) {
            const [, paramName, optionalMarker, suffix] = paramMatch;
            params.push({ name: paramName, isOptional: optionalMarker !== undefined });
            const escapedSuffix = escapeRegExp(toComparableSegment(suffix));
            if (!optionalMarker) {
                source += `/([^/]+)${escapedSuffix}`;
            } else if (suffix) {
                source += `/([^/]*)${escapedSuffix}`;
            } else {
                source += "(?:/([^/]*))?";
            }
        } else if (segment.endsWith("?")) {
            source += `(?:/${escapeRegExp(toComparableSegment(segment.slice(0, -1)))})?`;
        } else {
            source += `/${escapeRegExp(toComparableSegment(segment))}`;
        }
    }

    if (hasSplat) {
        params.push({ name: "*", isOptional: false });
        source += segments.length === 0 ? "(.*)$" : "(?:/(.+)|/*)$";
    } else if (end) {
        source += "/*$";
    } else if (segments.length > 0) {
        source += "(?=/|$)";
    }

    return { regExp: new RegExp(source, "i"), params };
}

function toPublishedPathname(comparablePathname: string, encodePathname: ((pathname: string) => string) | undefined) {
    const pathname = comparablePathname.replace(/\?/g, "%3F").replace(/#/g, "%23");
    return encodePathname ? encodePathname(pathname) : pathname;
}

export interface MatchAbsolutePathOptions {
    /**
     * Matches only the whole pathname instead of its beginning.
     */
    end: boolean;
    /**
     * Encodes the matched URL like the history encodes the URLs of routes. Without it, the URL is decoded except for `%`, `/`, `?` and `#`
     * in segments, like the URLs of routes in memory history.
     */
    encodePathname?: (pathname: string) => string;
}

/**
 * Matches an absolute pattern against an absolute pathname. Params are decoded.
 *
 * Like React Router matches routes, the literal segments of the pattern and the segments of the pathname are compared decoded and
 * case-insensitively. This matters because patterns are built from the URLs of routes, while the location keeps the encoding of the URL
 * that was opened: React Router encodes the URLs of routes canonically in browser history and keeps them decoded in memory history.
 */
export function matchAbsolutePath(pattern: string, pathname: string, { end, encodePathname }: MatchAbsolutePathOptions): PathMatch | null {
    const { regExp, params: compiledParams } = compileAbsolutePattern(pattern, end);
    const match = regExp.exec(toComparablePathname(pathname));
    if (!match) {
        return null;
    }

    const matchedPathname = match[0];
    const params: Record<string, string | undefined> = {};
    let pathnameBase = removeTrailingSlashes(matchedPathname);
    for (const [index, { name, isOptional }] of compiledParams.entries()) {
        const value = match[index + 1] ?? "";
        if (name === "*") {
            pathnameBase = removeTrailingSlashes(matchedPathname.slice(0, matchedPathname.length - value.length));
        }
        params[name] = isOptional && !value ? undefined : decodeURIComponent(value);
    }

    return {
        params,
        pathname: toPublishedPathname(matchedPathname, encodePathname),
        pathnameBase: toPublishedPathname(pathnameBase, encodePathname),
        pattern: { path: removeDuplicateSlashes(pattern), end },
    };
}

/**
 * Tells whether `pathname` starts with `prefix`, comparing their segments decoded.
 */
export function isPathnameStartingWith(pathname: string, prefix: string): boolean {
    return toComparablePathname(pathname).startsWith(toComparablePathname(prefix));
}

/**
 * Returns the part of `pathname` below the pathname of a match, in the encoding of `pathname`.
 */
export function getPathnameBelowMatch(pathname: string, match: PathMatch): string {
    const matchedSegmentCount = match.pathname === "/" ? 1 : match.pathname.split("/").length;
    return pathname.split("/").slice(matchedSegmentCount).join("/");
}
