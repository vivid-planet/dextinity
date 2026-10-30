import { createServer } from "http";
import next from "next";
import { parse } from "url";

import { withMetrics } from "./opentelemetry-metrics";

const dev = process.env.NODE_ENV !== "production";
const host = process.env.SERVER_HOST ?? "localhost";
const port = parseInt(process.env.SITE_PORT || "3000", 10);
const cdnOriginCheckSecret = process.env.CDN_ORIGIN_CHECK_SECRET;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname: host, port, webpack: true });

app.prepare().then(() => {
    if (process.env.TRACING == "production") {
        require("./tracing.production");
    } else if (process.env.TRACING == "dev") {
        require("./tracing.dev");
    }
    const handle = withMetrics(app.getRequestHandler());

    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const parsedUrl = parse(req.url!, true);

            if (cdnOriginCheckSecret) {
                if (req.headers["x-cdn-origin-check"] !== cdnOriginCheckSecret) {
                    res.statusCode = 403;
                    res.end();
                    return;
                }
            }

            let maxAge: string | undefined;

            if (parsedUrl.pathname?.startsWith("/assets/")) {
                // assets in public/assets/* are cached for 1 week. When updated without changing the filename, the cache is not invalidated.
                // To force an immediate update of a file, ensure the filename is changed as well
                maxAge = "604800"; // 1 week cache
            } else if (parsedUrl.pathname == "/apple-icon.png" || parsedUrl.pathname == "/icon.svg") {
                // the icon and apple-icon in the /app folder automatically have a generated string added to the filename, so they can be cached for a long time because the hash changes when the file content changes
                // see: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#icon
                maxAge = "31536000"; // 1 year cache
            } else if (parsedUrl.pathname == "/robots.txt" || parsedUrl.pathname == "/sitemap.xml" || parsedUrl.pathname == "/favicon.ico") {
                maxAge = "900"; // 15 minutes cache
            }

            if (maxAge) {
                res.setHeader("Cache-Control", `public, max-age=${maxAge}`);

                const origSetHeader = res.setHeader;
                res.setHeader = function (name: string, value: string | number | readonly string[]) {
                    if (name === "cache-control" || name === "Cache-Control") {
                        // ignore
                        return this;
                    }
                    return origSetHeader.call(this, name, value);
                };
            }

            // For Rsc requests: don't cache the response if the _rsc query param is missing
            const rscParamMissing = !!req.headers["rsc"] && !new URLSearchParams(parsedUrl.search || "").has("_rsc");

            const originalWriteHead = res.writeHead;
            res.writeHead = function (statusCode: number, ...args: unknown[]) {
                // since writeHead is a callback function, it's called after handle() -> we get the actual response statusCode
                if (statusCode >= 400 || rscParamMissing) {
                    // prevent caching of error responses
                    res.setHeader("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
                }

                // For redirects: append _rsc query param to redirect location if set in the original request
                const rsc = new URLSearchParams(parsedUrl.search || "").get("_rsc");
                const location = res.getHeader("location")?.toString() || "";
                if (rsc && location.startsWith("/")) {
                    const redirectUrl = parse(location, true);
                    const redirectSearchParams = new URLSearchParams(redirectUrl.search || "");
                    if (!redirectSearchParams.has("_rsc")) {
                        redirectSearchParams.set("_rsc", rsc);
                        res.setHeader("location", `${redirectUrl.pathname}?${redirectSearchParams.toString()}`);
                    }
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (originalWriteHead as any).apply(this, [statusCode, ...args]);
            };

            await handle(req, res, parsedUrl);
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
});
