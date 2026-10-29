import { noStoreCacheControl } from "@dextinity/site-vite-rsc/server";
import { createMiddleware } from "hono/factory";

export const errorResponseCacheControlMiddleware = createMiddleware(async (c, next) => {
    await next();

    if (c.res.status >= 400) {
        c.header("Cache-Control", noStoreCacheControl);
    }
});
