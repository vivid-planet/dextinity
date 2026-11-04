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

import { reportError } from "./reportError";

const app = new Hono();
app.use("/cdn/*", cdnOriginCheckMiddleware({ secret: "cdn-secret" }));
app.use(errorResponseCacheControlMiddleware);
if (import.meta.env.PROD) {
    app.use(staticFilesMiddleware);
}
app.use(trailingSlashRedirectMiddleware);
app.all("*", async (c) => {
    const response = await matchRscRequest({
        request: c.req.raw,
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
    const ssr = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr")>("ssr", "index");
    return ssr.generateHTML(c.req.raw, response);
});

export default { fetch: app.fetch };
