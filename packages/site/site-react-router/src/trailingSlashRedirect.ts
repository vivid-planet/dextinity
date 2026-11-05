/**
 * Redirects paths with a trailing slash to the path without it, like Next.js does, so that a page has a single URL.
 * Use it in `entry.rsc.tsx` before matching the request.
 *
 * @returns A 308 redirect, or `undefined` if the path has no trailing slash
 */
export function trailingSlashRedirect(request: Request): Response | undefined {
    const url = new URL(request.url);
    if (url.pathname === "/" || !url.pathname.endsWith("/")) {
        return undefined;
    }
    // Collapses leading slashes, which would make the location a protocol-relative URL of another host, e.g. "//example.com/"
    const pathname = `/${url.pathname.replace(/^\/+/, "").replace(/\/+$/, "")}`;
    return new Response(null, { status: 308, headers: { Location: `${pathname}${url.search}` } });
}
