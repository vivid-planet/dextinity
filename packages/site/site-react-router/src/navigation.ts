import { data, redirect as reactRouterRedirect } from "react-router";

import { isAllowedRedirectTarget } from "./redirectTarget.js";

/**
 * Renders the closest `ErrorBoundary` with a 404 response, e.g. in a loader when the page doesn't exist
 */
export function notFound(): never {
    throw data(null, { status: 404 });
}

/**
 * Redirects in a loader or a middleware, temporarily by default. Only accepts http(s), `mailto:` and `tel:` URLs and relative paths,
 * as targets also come from the CMS, e.g. no `javascript:` URLs from redirect entries.
 *
 * @param init The status or the init of the response like React Router's `redirect()`, e.g. with the `Cache-Control` of the page
 */
export function redirect(location: string, init: number | ResponseInit = 307): never {
    if (!isAllowedRedirectTarget(location)) {
        throw new Error(`Redirect to ${location} disallowed: only http(s), mailto and tel URLs and relative paths are allowed`);
    }
    throw reactRouterRedirect(location, typeof init === "number" ? init : { status: 307, ...init });
}
