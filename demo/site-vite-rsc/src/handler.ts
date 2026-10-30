import {
    errorResponseCacheControlMiddleware,
    handleError,
    sitePreviewMiddleware,
    sitePreviewRoute,
    staticFilesMiddleware,
    trailingSlashRedirectMiddleware,
} from "@dextinity/site-vite-rsc/server";
import { statusRoute } from "@src/routes/api/statusRoute";
import { damRoute } from "@src/routes/damRoute";
import { blockPreviewRoutes, mailRoutes, renderNotFoundPage, siteRoutes } from "@src/routes/router";
import { Hono } from "hono";

import { contentSecurityPolicyHeadersMiddleware } from "./middleware/contentSecurityPolicyHeaders";
import { predefinedPagesMiddleware } from "./middleware/predefinedPages";
import { previewDomainMiddleware } from "./middleware/preview";
import { redirectToMainHostMiddleware } from "./middleware/redirectToMainHost";
import { securityHeadersMiddleware } from "./middleware/securityHeaders";
import { siteContextMiddleware } from "./middleware/siteContext";

// Middlewares only apply to the routes registered after them, a route that responds skips the rest
export const app = new Hono();

app.use(securityHeadersMiddleware, errorResponseCacheControlMiddleware);
if (import.meta.env.PROD) {
    app.use(staticFilesMiddleware);
}

app.use(trailingSlashRedirectMiddleware);

app.get("/api/status", statusRoute);
app.all("/dam/*", damRoute);
app.route("/api", mailRoutes);

app.use(contentSecurityPolicyHeadersMiddleware);

app.get("/site-preview", sitePreviewRoute);
app.route("/block-preview", blockPreviewRoutes);

app.use(sitePreviewMiddleware, siteContextMiddleware, previewDomainMiddleware, redirectToMainHostMiddleware);

// The site context is available from here on
app.use(predefinedPagesMiddleware);

app.route("/", siteRoutes);

// Rendered with the layout of the site, so it needs the site context of the middlewares
app.notFound(renderNotFoundPage);
app.onError(handleError);
