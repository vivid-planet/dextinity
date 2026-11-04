import { createServer } from "node:http";

import { createRequestListener } from "@remix-run/node-fetch-server";

import { cdnOriginCheck, compressResponse, createStaticFileHandler } from "../../lib/node.js";

// Started by playwright.config.ts: with Vite during development and with the build in production, like the server of a site
const server = createServer();

if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } } });
    server.on("request", vite.middlewares);
} else {
    // @ts-expect-error The build doesn't exist before `react-router build`
    const { default: rscEntry } = (await import("./build/server/index.js")) as { default: { fetch: (request: Request) => Promise<Response> } };
    const serveStaticFile = createStaticFileHandler({
        directory: "build/client",
        cacheControl: (pathname) => (pathname.startsWith("/_assets/") ? "public, max-age=31536000, immutable" : "public, max-age=900"),
    });
    server.on(
        "request",
        createRequestListener(async (request) => {
            if (process.env.CDN_ORIGIN_CHECK_SECRET && new URL(request.url).pathname.startsWith("/cdn/")) {
                const rejection = cdnOriginCheck(request, { secret: process.env.CDN_ORIGIN_CHECK_SECRET });
                if (rejection) {
                    return rejection;
                }
            }
            return compressResponse(request, (await serveStaticFile(request)) ?? (await rscEntry.fetch(request)));
        }),
    );
}

server.listen(Number(process.env.PORT));
