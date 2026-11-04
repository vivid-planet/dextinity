/**
 * For responses that must not be cached, e.g. errors and previews
 */
export const noStoreCacheControl = "private, no-cache, no-store, max-age=0, must-revalidate";

/**
 * Prevents caching of error responses, e.g. a 404 page or a failing API, which would otherwise be cached like the page
 * by the `headers` of the route.
 */
export function preventCachingOfErrorResponse(response: Response): Response {
    if (response.status >= 400) {
        response.headers.set("Cache-Control", noStoreCacheControl);
    }
    return response;
}
