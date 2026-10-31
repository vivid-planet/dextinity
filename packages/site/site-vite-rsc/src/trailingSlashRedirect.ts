import { createMiddleware } from "hono/factory";

/**
 * @returns The pathname to redirect to if the pathname has a trailing slash
 */
export function getPathnameWithoutTrailingSlash(pathname: string): string | undefined {
    if (pathname === "/" || !pathname.endsWith("/")) {
        return undefined;
    }
    // Leading slashes are collapsed, as a location like "//example.com" redirects to another host
    return pathname.replace(/\/+$/, "").replace(/^\/+/, "/") || "/";
}

/**
 * Redirects URLs with a trailing slash to the URL without, so that every page has a single URL.
 */
export const trailingSlashRedirectMiddleware = createMiddleware(async (c, next) => {
    const { pathname, search } = new URL(c.req.url);
    const redirectPathname = getPathnameWithoutTrailingSlash(pathname);
    if (redirectPathname) {
        return c.redirect(`${redirectPathname}${search}`, 308);
    }
    await next();
});
