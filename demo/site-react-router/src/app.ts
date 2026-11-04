import {
    cdnOriginCheckMiddleware,
    errorResponseCacheControlMiddleware,
    staticFilesMiddleware,
    trailingSlashRedirectMiddleware,
} from "@dextinity/site-react-router/server";
import { Hono } from "hono";
import { createRequestHandler, RouterContextProvider } from "react-router";
import * as build from "virtual:react-router/server-build";

import { contentSecurityPolicyHeadersMiddleware } from "./middleware/contentSecurityPolicyHeaders.server";
import { securityHeadersMiddleware } from "./middleware/securityHeaders.server";

const handleRequest = createRequestHandler(build, import.meta.env.MODE);

/**
 * The server entry of the site (`build.rollupOptions.input` in vite.config.ts), loaded by `createRequestListener()` in server.ts.
 * Handles what also applies to the static files, React Router handles the rest with the routes in routes.ts.
 */
export const app = new Hono();

if (process.env.CDN_ORIGIN_CHECK_SECRET) {
    app.use(cdnOriginCheckMiddleware({ secret: process.env.CDN_ORIGIN_CHECK_SECRET }));
}
app.use(securityHeadersMiddleware, errorResponseCacheControlMiddleware);
if (import.meta.env.PROD) {
    app.use(staticFilesMiddleware);
}
app.use(trailingSlashRedirectMiddleware, contentSecurityPolicyHeadersMiddleware);
app.all("*", (c) => handleRequest(c.req.raw, new RouterContextProvider()));
