import { app } from "virtual:dextinity-site/app";

import { runWithRequestContext } from "./requestContext.js";
import { addRscPrefix, stripRscPrefix } from "./rscRequest.js";

async function handler(request: Request): Promise<Response> {
    const strippedUrl = stripRscPrefix(new URL(request.url));
    const isRscRequest = strippedUrl !== null;
    if (strippedUrl) {
        request = new Request(strippedUrl, { method: request.method, headers: request.headers, signal: request.signal });
    }

    const response = await runWithRequestContext({ request, isRscRequest }, () => app.fetch(request));

    const location = response.headers.get("Location");
    if (isRscRequest && location?.startsWith("/") && !location.startsWith("//")) {
        // Keep following redirects as RSC requests, the browser entry strips the prefix from the final URL
        const redirectUrl = new URL(location, request.url);
        const redirectResponse = new Response(response.body, response);
        redirectResponse.headers.set("Location", `${addRscPrefix(redirectUrl.pathname)}${redirectUrl.search}`);
        return redirectResponse;
    }

    return response;
}

export default { fetch: handler };

if (import.meta.hot) {
    import.meta.hot.accept();
}
