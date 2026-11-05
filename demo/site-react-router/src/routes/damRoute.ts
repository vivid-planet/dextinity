import type { Route } from "./+types/damRoute";

/**
 * Passes the DAM files to the API, so that they are delivered from the domain of the site, like the rewrite of the Next.js site
 */
export async function loader({ request }: Route.LoaderArgs) {
    const { pathname } = new URL(request.url);
    const headers = new Headers(request.headers);
    headers.delete("host");
    const response = await fetch(`${process.env.API_URL_INTERNAL}${pathname}`, { headers, signal: request.signal });

    // fetch() has already decoded the body
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("Content-Encoding");
    responseHeaders.delete("Content-Length");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
}
