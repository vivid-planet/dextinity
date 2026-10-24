import type { IncomingMessage, ServerResponse } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { getRequestListener } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { compress } from "hono/compress";

import { withMetrics } from "./opentelemetry-metrics.js";

const dev = process.env.NODE_ENV !== "production";
const host = process.env.SERVER_HOST ?? "localhost";
const port = parseInt(process.env.SITE_PORT || "3000", 10);
const cdnOriginCheckSecret = process.env.CDN_ORIGIN_CHECK_SECRET;

// Content-Security-Policy and CORS are set in middleware/contentSecurityPolicyHeaders.ts
const securityHeaders = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload", // 2 years (recommended when subdomains are included)
    "Cross-Origin-Opener-Policy": "same-origin", // Only allow the same origin to open the page in a browsing context
    // This value should be set to 'require-corp' as soon as iframe credentialless is supported by all browsers
    // https://developer.mozilla.org/en-US/docs/Web/Security/IFrame_credentialless
    // https://caniuse.com/mdn-html_elements_iframe_credentialless
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    "Cross-Origin-Resource-Policy": "same-site", // Do not allow cross-origin requests to access the response
    "Permissions-Policy": "",
    "X-Content-Type-Options": "nosniff", // Prevent MIME sniffing
    // This should be changed when using web analytics tools. For example, use "strict-origin-when-cross-origin" for Google Analytics
    "Referrer-Policy": "same-origin", // Only use referer on own domain.
};

function getStaticFileMaxAge(pathname: string) {
    if (pathname.startsWith("/_assets/")) {
        // build assets have a content hash in their filename
        return 31536000; // 1 year cache
    } else if (pathname.startsWith("/assets/")) {
        // assets in public/assets/* are cached for 1 week. When updated without changing the filename, the cache is not invalidated.
        // To force an immediate update of a file, ensure the filename is changed as well
        return 604800; // 1 week cache
    } else if (["/robots.txt", "/sitemap.xml", "/favicon.ico", "/icon.svg", "/apple-icon.png"].includes(pathname)) {
        return 900; // 15 minutes cache
    }
    return undefined;
}

async function createProductionHandler() {
    const { default: rscHandler } = (await import(pathToFileURL(resolve("dist/rsc/index.js")).href)) as {
        default: { fetch: (request: Request) => Promise<Response> };
    };

    const app = new Hono();
    app.use(compress());
    app.use(async (c, next) => {
        await next();
        const maxAge = getStaticFileMaxAge(c.req.path);
        if (c.res.status >= 400) {
            // prevent caching of error responses
            c.header("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
        } else if (maxAge) {
            c.header("Cache-Control", `public, max-age=${maxAge}`);
        }
    });
    app.use(serveStatic({ root: "./dist/client" }));
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

                for (const [name, value] of Object.entries(securityHeaders)) {
                    res.setHeader(name, value);
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
