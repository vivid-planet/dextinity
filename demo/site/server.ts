import type { IncomingMessage, ServerResponse } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { compress } from "hono/compress";

import { withMetrics } from "./opentelemetry-metrics.js";

const dev = process.env.NODE_ENV !== "production";
const host = process.env.SERVER_HOST ?? "localhost";
const port = parseInt(process.env.SITE_PORT || "3000", 10);
const cdnOriginCheckSecret = process.env.CDN_ORIGIN_CHECK_SECRET;

async function createProductionHandler() {
    const { default: rscHandler } = (await import(pathToFileURL(resolve("dist/rsc/index.js")).href)) as {
        default: { fetch: (request: Request) => Promise<Response> };
    };

    // Headers and static files are handled by the site's Hono app, see src/handler.ts
    const app = new Hono();
    app.use(compress());
    app.all("*", (c) => rscHandler.fetch(c.req.raw));

    return getRequestListener(app.fetch);
}

async function main() {
    process.on("unhandledRejection", (reason) => {
        console.error("Unhandled rejection", reason);
    });

    if (process.env.TRACING == "production") {
        await import("./tracing.production.js");
    } else if (process.env.TRACING == "dev") {
        await import("./tracing.dev.js");
    }

    // Required after setting up tracing, so that the http module is instrumented
    const { createServer } = createRequire(import.meta.url)("node:http") as typeof import("node:http");
    const server = createServer();

    let handle: (req: IncomingMessage, res: ServerResponse) => unknown;
    if (dev) {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } } });
        handle = vite.middlewares;
    } else {
        handle = await createProductionHandler();
    }
    const handleWithMetrics = withMetrics(async (req, res) => {
        await handle(req, res);
    });

    server
        .on("request", async (req: IncomingMessage, res: ServerResponse) => {
            try {
                if (cdnOriginCheckSecret) {
                    if (req.headers["x-cdn-origin-check"] !== cdnOriginCheckSecret) {
                        res.statusCode = 403;
                        res.end();
                        return;
                    }
                }

                await handleWithMetrics(req, res);
            } catch (err) {
                console.error("Error occurred handling", req.url, err);
                res.statusCode = 500;
                res.end("internal server error");
            }
        })
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, host, () => {
            // eslint-disable-next-line no-console
            console.log(`> Ready on http://${host}:${port}`);
        });
}

main();
