import { createHash, timingSafeEqual } from "node:crypto";

import { noStoreCacheControl } from "../cacheControl";

const hash = (value: string) => createHash("sha256").update(value).digest();

/**
 * Rejects requests that don't come from the CDN, which sends the secret in the `x-cdn-origin-check` header.
 * Use it before handling a request, also of the static files.
 *
 * @returns A 403 response if the request didn't pass the CDN, otherwise `undefined`
 */
export function cdnOriginCheck(request: Request, { secret }: { secret: string }): Response | undefined {
    const value = request.headers.get("x-cdn-origin-check");
    if (value !== null && timingSafeEqual(hash(value), hash(secret))) {
        return undefined;
    }
    return new Response(null, { status: 403, headers: { "Cache-Control": noStoreCacheControl } });
}
