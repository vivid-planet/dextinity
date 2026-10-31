import { app } from "virtual:dextinity-site/app";
import { reportError as reportErrorOfSite } from "virtual:dextinity-site/report-error";

import { noStoreCacheControl } from "./cacheControl.js";
import { isAllowedRedirectTarget } from "./redirectTarget.js";
import { renderRedirectPayload } from "./render.js";
import { reportError, setErrorReporter } from "./reportError.js";
import { runWithRequestContext } from "./requestContext.js";
import { stripRscPrefix } from "./rscRequest.js";

setErrorReporter(reportErrorOfSite);

const redirectStatuses = [301, 302, 303, 307, 308];

async function handler(request: Request): Promise<Response> {
    const strippedUrl = stripRscPrefix(new URL(request.url));
    const isRscRequest = strippedUrl !== null;
    if (strippedUrl) {
        request = new Request(strippedUrl, { method: request.method, headers: request.headers, signal: request.signal });
    }

    const response = await runWithRequestContext({ request, isRscRequest }, () => app.fetch(request));

    const location = response.headers.get("Location");
    if (isRscRequest && location !== null && redirectStatuses.includes(response.status)) {
        return createRedirectPayloadResponse(response, location);
    }

    return response;
}

/**
 * fetch() in the browser would follow the redirect itself, which fails for other origins (CORS, CSP) and loses the page
 * URL of relative targets, so the browser entry follows the location of the payload instead
 */
async function createRedirectPayloadResponse(response: Response, location: string) {
    await response.body?.cancel();
    if (!isAllowedRedirectTarget(location)) {
        reportError(new Error(`Redirect to ${location} disallowed: only http(s), mailto and tel URLs and relative paths are allowed`));
        return new Response("Internal Server Error", {
            status: 500,
            headers: { "Content-Type": "text/plain;charset=utf-8", "Cache-Control": noStoreCacheControl },
        });
    }

    const headers = new Headers(response.headers); // Keeps e.g. cookies set before redirecting
    headers.delete("Location");
    headers.delete("Content-Length");
    headers.set("Content-Type", "text/x-component;charset=utf-8");
    // Without an explicit Cache-Control, the CDN's defaults would decide, and a cached cookie would be set for everyone
    if (!headers.has("Cache-Control") || headers.has("Set-Cookie")) {
        headers.set("Cache-Control", noStoreCacheControl);
    }
    headers.set("X-Robots-Tag", "noindex");
    return new Response(await renderRedirectPayload(location), { headers });
}

export default { fetch: handler };

if (import.meta.hot) {
    import.meta.hot.accept();
}
