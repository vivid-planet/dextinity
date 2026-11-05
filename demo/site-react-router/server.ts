import type { IncomingMessage, ServerResponse } from "node:http";
import { createRequire } from "node:module";

import { cdnOriginCheck, compressResponse, createStaticFileHandler } from "@dextinity/site-react-router/node";
import { createRequestListener } from "@remix-run/node-fetch-server";

import { withMetrics } from "./opentelemetry-metrics.ts";

const dev = process.env.NODE_ENV !== "production";
const host = process.env.SERVER_HOST ?? "localhost";
const port = parseInt(process.env.SITE_PORT || "3002", 10);
const cdnOriginCheckSecret = process.env.CDN_ORIGIN_CHECK_SECRET;

type RequestListener = (request: IncomingMessage, response: ServerResponse) => Promise<void>;

/**
 * Serves the client build and passes the other requests to the server build of src/entry.rsc.tsx
 */
async function createProductionRequestListener(): Promise<RequestListener> {
    // @ts-expect-error The build doesn't exist before `pnpm run build`
    const { default: rscEntry } = (await import("./build/server/index.js")) as { default: { fetch: (request: Request) => Promise<Response> } };

    const serveStaticFile = createStaticFileHandler({
        directory: "build/client",
        cacheControl: (pathname) => {
            if (pathname.startsWith("/_assets/")) {
                return "public, max-age=31536000, immutable"; // Hashed build assets
            }
            if (pathname.startsWith("/assets/")) {
                // Files of public/assets keep their name, so a changed file is only loaded after a week. Rename it for an immediate update.
                return "public, max-age=604800";
            }
            return "public, max-age=900";
        },
    });

    return createRequestListener(async (request) => {
        if (cdnOriginCheckSecret) {
            const rejection = cdnOriginCheck(request, { secret: cdnOriginCheckSecret });
            if (rejection) {
                return rejection;
            }
        }
        return compressResponse(request, (await serveStaticFile(request)) ?? (await rscEntry.fetch(request)));
    }) as RequestListener;
}

async function main() {
    process.on("unhandledRejection", (reason) => {
        console.error("Unhandled rejection", reason);
    });

    if (process.env.TRACING == "production") {
        await import("./tracing.production.ts");
    } else if (process.env.TRACING == "dev") {
        await import("./tracing.dev.ts");
    }

    // Required after setting up the tracing, so that the http module is instrumented
    const { createServer } = createRequire(import.meta.url)("node:http") as typeof import("node:http");
    const server = createServer();

    let handle: RequestListener;
    if (dev) {
        // Vite handles the requests with src/entry.rsc.tsx and serves the client code and public/
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } } });
        handle = (request, response) =>
            new Promise<void>((resolve) => {
                response.once("close", resolve);
                vite.middlewares(request, response, () => {
                    response.statusCode = 404;
                    response.end();
                });
            });
    } else {
        handle = await createProductionRequestListener();
    }
    const handleWithMetrics = withMetrics(handle);

    server
        .on("request", async (request: IncomingMessage, response: ServerResponse) => {
            try {
                await handleWithMetrics(request, response);
            } catch (error) {
                console.error("Error occurred handling", request.url, error);
                response.statusCode = 500;
                response.end("internal server error");
            }
        })
        .once("error", (error) => {
            console.error(error);
            process.exit(1);
        })
        .listen(port, host, () => {
            // eslint-disable-next-line no-console
            console.log(`> Ready on http://${host}:${port}`);
        });
}

main();
