import { adminRoute } from "@src/app/admin/route";
import { statusRoute } from "@src/app/api/status/route";
import { damRoute } from "@src/app/dam/route";
import { robotsRoute } from "@src/app/robots";
import { blockPreviewRoutes, mailRoutes, renderRootNotFoundPage, siteRoutes } from "@src/app/router";
import { sitePreviewRoute } from "@src/app/site-preview/route";
import { handleError } from "@src/framework/handleError";
import { trailingSlashRedirectMiddleware } from "@src/framework/trailingSlashRedirect";
import { Hono } from "hono";

import { contentSecurityPolicyHeadersMiddleware } from "./middleware/contentSecurityPolicyHeaders";
import { predefinedPagesMiddleware } from "./middleware/predefinedPages";
import { previewDomainMiddleware } from "./middleware/preview";
import { redirectToMainHostMiddleware } from "./middleware/redirectToMainHost";
import { siteContextMiddleware } from "./middleware/siteContext";

// Middlewares only apply to the routes registered after them, a route that responds skips the rest
export const app = new Hono();

app.use(trailingSlashRedirectMiddleware);

app.get("/api/status", statusRoute);
app.get("/admin", adminRoute);
app.all("/dam/*", damRoute);
app.route("/api", mailRoutes);
// Unknown API routes and missing static files don't need the site middlewares
app.on("ALL", ["/api/*", "/assets/*", "/_assets/*", "/favicon.ico", "/apple-icon.png", "/icon.svg", "/manifest.json"], renderRootNotFoundPage);

app.use(contentSecurityPolicyHeadersMiddleware);

app.get("/site-preview", sitePreviewRoute);
app.route("/block-preview", blockPreviewRoutes);
app.all("/block-preview/*", renderRootNotFoundPage);

app.use(previewDomainMiddleware, redirectToMainHostMiddleware);

// May only be served after the main host redirect
app.get("/robots.txt", robotsRoute);

app.use(siteContextMiddleware, predefinedPagesMiddleware);

app.route("/", siteRoutes);

app.notFound(renderRootNotFoundPage);
app.onError(handleError);
