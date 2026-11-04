import { createHash, timingSafeEqual } from "node:crypto";

import { createMiddleware } from "hono/factory";

import { noStoreCacheControl } from "./cacheControl.js";

// Hashing gives both values the same length, which timingSafeEqual requires, without leaking the length of the secret
function sha256(value: string) {
    return createHash("sha256").update(value).digest();
}

/**
 * Only allows requests with the `x-cdn-origin-check` header set to `secret`, so that the site is only reachable via the CDN.
 * Register it first, so that it also covers the static files.
 */
export function cdnOriginCheckMiddleware({ secret }: { secret: string }) {
    const secretHash = sha256(secret);
    return createMiddleware(async (c, next) => {
        const header = c.req.header("x-cdn-origin-check");
        if (header === undefined || !timingSafeEqual(sha256(header), secretHash)) {
            return c.body(null, 403, { "Cache-Control": noStoreCacheControl });
        }
        await next();
    });
}
