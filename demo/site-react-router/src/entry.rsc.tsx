import {
    createRSCResponseRenderer,
    preventCachingOfErrorResponse,
    runWithRequestContext,
    trailingSlashRedirect,
} from "@dextinity/site-react-router/server";
import { withSecurityHeaders } from "@src/middleware/securityHeaders";
import { reportError } from "@src/util/reportError";
import {
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { RouterContextProvider, unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";
import basename from "virtual:react-router/unstable_rsc/basename";
import clientVersion from "virtual:react-router/unstable_rsc/client-version";
import routeDiscovery from "virtual:react-router/unstable_rsc/route-discovery";
import routes from "virtual:react-router/unstable_rsc/routes";

/**
 * Matches the request with the routes of routes.ts and renders the RSC payload, like the default entry.rsc.tsx of React Router
 */
async function fetchServer(request: Request, requestContext: RouterContextProvider) {
    const renderer = createRSCResponseRenderer({ renderToReadableStream, reportError });

    // Server components read the context that the middlewares fill with getRequestContext()
    const response = await runWithRequestContext(requestContext, () =>
        matchRSCServerRequest({
            basename,
            createTemporaryReferenceSet,
            decodeAction,
            decodeFormState,
            decodeReply,
            loadServerAction,
            clientVersion,
            request,
            requestContext,
            routes,
            routeDiscovery,
            onError: renderer.onError,
            generateResponse: renderer.generateResponse,
        }),
    );

    return renderer.completeResponse(request, response);
}

/**
 * Handles the requests of the site, see server.ts
 */
export default {
    async fetch(request: Request): Promise<Response> {
        const redirect = trailingSlashRedirect(request);
        if (redirect) {
            return redirect;
        }

        const ssr = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr")>("ssr", "index");
        const response = await ssr.generateHTML(request, await fetchServer(request, new RouterContextProvider()));
        return withSecurityHeaders(preventCachingOfErrorResponse(response));
    },
};

if (import.meta.hot) {
    import.meta.hot.accept();
}
