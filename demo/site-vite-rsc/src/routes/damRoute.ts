import type { Context } from "hono";
import { proxy } from "hono/proxy";

export function damRoute(c: Context) {
    return proxy(`${process.env.API_URL_INTERNAL}${c.req.path}`, {
        method: c.req.method,
        headers: { ...c.req.header(), host: undefined },
    });
}
