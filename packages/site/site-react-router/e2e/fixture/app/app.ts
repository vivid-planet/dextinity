import {
    cdnOriginCheckMiddleware,
    errorResponseCacheControlMiddleware,
    staticFilesMiddleware,
    trailingSlashRedirectMiddleware,
} from "@dextinity/site-react-router/server";
import { Hono } from "hono";
import { createRequestHandler, RouterContextProvider } from "react-router";
import * as build from "virtual:react-router/server-build";

const handleRequest = createRequestHandler(build, import.meta.env.MODE);

export const app = new Hono();
app.use("/cdn/*", cdnOriginCheckMiddleware({ secret: "cdn-secret" }));
app.use(errorResponseCacheControlMiddleware);
if (import.meta.env.PROD) {
    app.use(staticFilesMiddleware);
}
app.use(trailingSlashRedirectMiddleware);
app.all("*", (c) => handleRequest(c.req.raw, new RouterContextProvider()));
