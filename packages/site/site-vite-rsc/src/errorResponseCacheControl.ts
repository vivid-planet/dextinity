import { createMiddleware } from "hono/factory";

import { noStoreCacheControl } from "./cacheControl.js";

export const errorResponseCacheControlMiddleware = createMiddleware(async (c, next) => {
    await next();

    if (c.res.status >= 400) {
        c.header("Cache-Control", noStoreCacheControl);
    }
});
