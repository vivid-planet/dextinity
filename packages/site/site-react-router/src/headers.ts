import type { HeadersFunction } from "react-router";

/**
 * The `headers` export of page routes: uses the `Cache-Control` the loader returns with `data()`. React Router only uses the
 * headers of the deepest route with a `headers` export, without one the loader's headers are ignored.
 *
 * @example
 * export { cacheControlHeaders as headers } from "@dextinity/site-react-router";
 *
 * export async function loader() {
 *     return data(await loadPage(), { headers: { "Cache-Control": "s-maxage=450, stale-while-revalidate=31535550" } });
 * }
 */
export const cacheControlHeaders: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
    const headers = new Headers(parentHeaders);
    const cacheControl = loaderHeaders.get("Cache-Control");
    if (cacheControl) {
        headers.set("Cache-Control", cacheControl);
    }
    return headers;
};
