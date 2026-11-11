function splitPath(path: string) {
    return path.split("/").filter((segment) => segment !== "");
}

function matchSegments(routeSegments: string[], pathSegments: string[]) {
    if (routeSegments.length !== pathSegments.length) {
        return undefined;
    }

    const params: Record<string, string> = {};

    const isMatch = routeSegments.every((routeSegment, index) => {
        if (routeSegment.startsWith(":")) {
            params[routeSegment.substring(1)] = pathSegments[index];
            return true;
        }

        return routeSegment === pathSegments[index];
    });

    return isMatch ? params : undefined;
}

/**
 * Finds the first route whose path pattern matches the path. A segment starting with `:` matches any segment and is returned as a param.
 *
 * @example matchRoute([{ path: "/" }, { path: "/:slug" }], "/my-news") // { route: { path: "/:slug" }, params: { slug: "my-news" } }
 */
export function matchRoute<Route extends { path: string }>(routes: Route[], path: string) {
    const pathSegments = splitPath(path);

    for (const route of routes) {
        const params = matchSegments(splitPath(route.path), pathSegments);

        if (params) {
            return { route, params };
        }
    }

    return undefined;
}
