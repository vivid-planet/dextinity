import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { compress } from "hono/compress";

type RequestListener = (request: IncomingMessage, response: ServerResponse) => unknown;

type RscEntry = { default: { fetch: (request: Request) => Response | Promise<Response> } };

/**
 * Handles the requests of the site with its `entry.rsc.tsx`: with Vite during development and with the build in `build/server`
 * in production. The project's server adds what its operation needs, e.g. tracing and metrics.
 */
export async function createRequestListener({
    dev,
    server,
    buildPath = "build/server/index.js",
}: {
    dev: boolean;
    server: Server;
    buildPath?: string;
}): Promise<RequestListener> {
    if (dev) {
        const { createServer: createViteServer } = await import("vite");
        // @vitejs/plugin-rsc handles the requests with the RSC entry
        const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } } });
        return vite.middlewares;
    }

    const { default: rscEntry } = (await import(pathToFileURL(resolve(buildPath)).href)) as RscEntry;
    const app = new Hono();
    app.use(compress());
    app.all("*", (c) => rscEntry.fetch(c.req.raw));
    return getRequestListener(app.fetch);
}
