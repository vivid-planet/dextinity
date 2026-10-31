import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { compress } from "hono/compress";

type RequestListener = (request: IncomingMessage, response: ServerResponse) => unknown;

/**
 * Handles the requests of the site, with Vite during development and with the build in `dist/` in production.
 * The project's server adds what its operation needs, e.g. tracing, metrics and an origin check for the CDN.
 */
export async function createRequestListener({ dev, server }: { dev: boolean; server: Server }): Promise<RequestListener> {
    if (dev) {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } } });
        return vite.middlewares;
    }

    const { default: rscHandler } = (await import(pathToFileURL(resolve("dist/rsc/index.js")).href)) as {
        default: { fetch: (request: Request) => Promise<Response> };
    };

    // Headers and static files are handled by the site's Hono app
    const app = new Hono();
    app.use(compress());
    app.all("*", (c) => rscHandler.fetch(c.req.raw));

    return getRequestListener(app.fetch);
}
