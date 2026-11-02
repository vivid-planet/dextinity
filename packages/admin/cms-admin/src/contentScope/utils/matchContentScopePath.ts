import type { CurrentRouteMatch } from "@dextinity/admin";

const paramSegmentRegex = /^:(\w+)(?:\((.+)\))?$/;

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Matches a content scope path (e.g. `/:domain(main|secondary)/:language`) against the beginning of a pathname.
 * Supports param segments with an optional list of allowed values, which React Router's `matchPath()` doesn't support.
 */
export function matchContentScopePath(pattern: string, pathname: string): CurrentRouteMatch | null {
    const paramNames: string[] = [];
    const reactRouterPatternSegments: string[] = [];
    const regexSource = pattern
        .split("/")
        .filter((segment) => segment !== "")
        .map((segment) => {
            const paramMatch = segment.match(paramSegmentRegex);
            if (paramMatch) {
                const [, paramName, allowedValues] = paramMatch;
                reactRouterPatternSegments.push(`:${paramName}`);
                paramNames.push(paramName);
                return `/(?<param${paramNames.length - 1}>${allowedValues ?? "[^/]+"})`;
            }
            reactRouterPatternSegments.push(segment);
            return `/${escapeRegExp(segment)}`;
        })
        .join("");

    const match = new RegExp(`^${regexSource}(?=/|$)`, "i").exec(pathname);
    if (!match) {
        return null;
    }

    const params: Record<string, string> = {};
    paramNames.forEach((paramName, index) => {
        params[paramName] = decodeURIComponent(match.groups?.[`param${index}`] ?? "");
    });

    return { url: match[0] || "/", path: `/${reactRouterPatternSegments.join("/")}`, params };
}
