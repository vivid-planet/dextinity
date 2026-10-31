import type { Context } from "hono";
import { proxy } from "hono/proxy";

export function damRoute(c: Context) {
    return proxy(`${process.env.API_URL_INTERNAL}${c.req.path}`, {
        method: c.req.method,
        headers: { ...c.req.header(), host: undefined },
        // fetch() would request a compressed response and decode it, which the site's compression then encodes again
        customFetch: (request) => {
            request.headers.set("Accept-Encoding", "identity");
            return fetch(request);
        },
    });
}
