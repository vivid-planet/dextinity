import type { IncomingMessage, ServerResponse } from "node:http";
import { createRequire } from "node:module";

import { createRequestListener } from "@dextinity/site-vite-rsc/node";

const dev = process.env.NODE_ENV !== "production";
const host = process.env.SERVER_HOST ?? "localhost";
const port = parseInt(process.env.SITE_PORT || "3000", 10);

async function main() {
    process.on("unhandledRejection", (reason) => {
        console.error("Unhandled rejection", reason);
    });

    if (process.env.TRACING == "dev") {
        await import("./tracing.dev.js");
    }

    // Required after setting up tracing, so that the http module is instrumented
    const { createServer } = createRequire(import.meta.url)("node:http") as typeof import("node:http");
    const server = createServer();

    const handle = await createRequestListener({ dev, server });

    server
        .on("request", async (req: IncomingMessage, res: ServerResponse) => {
            try {
                await handle(req, res);
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
