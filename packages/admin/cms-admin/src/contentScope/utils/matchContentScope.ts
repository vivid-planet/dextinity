import { decodePathSegment } from "../../common/getPathnameBelowUrl";
import type { ContentScopeMatch, ContentScopePath } from "../Provider";

interface MatchedContentScopePath {
    path: ContentScopePath;
    match: ContentScopeMatch;
}

function isPathList(paths: ContentScopePath | ContentScopePath[]): paths is ContentScopePath[] {
    return paths.length > 0 && Array.isArray(paths[0]);
}

function matchPath(path: ContentScopePath, pathname: string): ContentScopeMatch | null {
    const rawSegments = pathname.split("/");
    if (rawSegments[0] !== "") {
        return null;
    }

    const params: Record<string, string> = {};
    for (const [index, { dimension, values }] of path.entries()) {
        const rawSegment = rawSegments[index + 1];
        if (!rawSegment) {
            return null;
        }
        const segment = decodePathSegment(rawSegment);
        if (!values.some((value) => value.toLowerCase() === segment.toLowerCase())) {
            return null;
        }
        params[dimension] = segment;
    }

    const url = rawSegments.slice(0, path.length + 1).join("/");
    const remainingPathname = pathname.slice(url.length);
    return { params, url, isExact: remainingPathname === "" || remainingPathname === "/" };
}

/**
 * Matches the leading segments of `pathname` case-insensitively against the paths, also when `pathname` is below them, with decoded params.
 * The first matching path wins. The URL of the match is the matched part of `pathname`.
 */
export function matchContentScope(paths: ContentScopePath | ContentScopePath[], pathname: string): MatchedContentScopePath | null {
    for (const path of isPathList(paths) ? paths : [paths]) {
        const match = matchPath(path, pathname);
        if (match) {
            return { path, match };
        }
    }
    return null;
}
