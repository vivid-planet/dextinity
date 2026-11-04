import {
    cdnOriginCheckMiddleware,
    errorResponseCacheControlMiddleware,
    matchRscRequest,
    staticFilesMiddleware,
    trailingSlashRedirectMiddleware,
} from "@dextinity/site-react-router/server";
import {
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { Hono } from "hono";
import basename from "virtual:react-router/unstable_rsc/basename";
import clientVersion from "virtual:react-router/unstable_rsc/client-version";
import routeDiscovery from "virtual:react-router/unstable_rsc/route-discovery";
import routes from "virtual:react-router/unstable_rsc/routes";

import { contentSecurityPolicyHeadersMiddleware } from "./middleware/contentSecurityPolicyHeaders";
import { securityHeadersMiddleware } from "./middleware/securityHeaders";
import { reportError } from "./util/reportError";

/**
 * The RSC payload of a request with the routes in routes.ts, like `fetchServer()` of the default entry of React Router
 */
function fetchServer(request: Request) {
    return matchRscRequest({
        request,
        routes,
        basename,
        clientVersion,
        routeDiscovery,
        createTemporaryReferenceSet,
        decodeAction,
        decodeFormState,
        decodeReply,
        loadServerAction,
        renderToReadableStream,
        reportError,
    });
}

/**
 * The entry of the site's server, loaded by `createRequestListener()` in server.ts. Handles what also applies to the static files,
 * React Router handles the rest.
 */
const app = new Hono();

if (process.env.CDN_ORIGIN_CHECK_SECRET) {
    app.use(cdnOriginCheckMiddleware({ secret: process.env.CDN_ORIGIN_CHECK_SECRET }));
}
app.use(securityHeadersMiddleware, errorResponseCacheControlMiddleware);
if (import.meta.env.PROD) {
    app.use(staticFilesMiddleware);
}
app.use(trailingSlashRedirectMiddleware, contentSecurityPolicyHeadersMiddleware);
app.all("*", async (c) => {
    const ssr = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr")>("ssr", "index");
    return ssr.generateHTML(c.req.raw, await fetchServer(c.req.raw));
});

export default { fetch: app.fetch };

if (import.meta.hot) {
    import.meta.hot.accept();
}
