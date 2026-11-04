import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { compress } from "hono/compress";

type RequestListener = (request: IncomingMessage, response: ServerResponse) => unknown;

type AppModule = { app: { fetch: (request: Request) => Response | Promise<Response> } };

/**
 * Handles the requests of the site with the Hono app exported as `app` by `appModule`: with Vite during development and with the
 * build in `build/server` in production, where Vite builds `appModule` as server entry (`build.rollupOptions.input`).
 * The project's server adds what its operation needs, e.g. tracing and metrics.
 */
export async function createRequestListener({
    dev,
    server,
    appModule,
    buildPath = "build/server/index.js",
}: {
    dev: boolean;
    server: Server;
    /** Relative to the Vite root, e.g. `./src/app.ts` */
    appModule: string;
    buildPath?: string;
}): Promise<RequestListener> {
    if (dev) {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } } });
        return (request, response) => {
            vite.middlewares(request, response, async () => {
                try {
                    // Loaded per request, so that changes are picked up without a restart
                    const { app } = (await vite.ssrLoadModule(appModule)) as AppModule;
                    await getRequestListener(app.fetch)(request, response);
                } catch (error) {
                    vite.ssrFixStacktrace(error as Error);
                    console.error(error);
                    response.statusCode = 500;
                    response.end("Internal Server Error");
                }
            });
        };
    }

    const { app: siteApp } = (await import(pathToFileURL(resolve(buildPath)).href)) as AppModule;
    const app = new Hono();
    app.use(compress());
    app.all("*", (c) => siteApp.fetch(c.req.raw));
    return getRequestListener(app.fetch);
}
