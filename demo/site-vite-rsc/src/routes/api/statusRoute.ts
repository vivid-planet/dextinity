import type { Context } from "hono";

export function statusRoute(c: Context) {
    return c.json({ status: "OK" }, 200, { "cache-control": "no-store" });
}
