import fs from "node:fs";

import express from "express";
import expressStaticGzip from "express-static-gzip";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const port = Number(process.env.ADMIN_PORT ?? 3000);
const host = process.env.SERVER_HOST ?? "localhost";
const previewUrls = process.env.PREVIEW_URL ? [process.env.PREVIEW_URL] : [];

let indexFile = fs.readFileSync("./build/index.html", "utf8");

// Replace environment variables
indexFile = indexFile.replace(/\$([A-Z_]+)/g, (match, p1) => {
    return process.env[p1] || "";
});

app.disable("x-powered-by"); // Disable the X-Powered-By header as it is not needed and can be used to infer the server technology

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'none'"], // Don't allow any content to be loaded if not explicitly allowed
                "script-src": [process.env.NODE_ENV === "development" ? "'self' 'unsafe-eval'" : "'self'"], // Unsafe eval is needed for the preview in local development
                "script-src-elem": ["'self'", "'unsafe-inline'"],
                "style-src-elem": ["'self'", "'unsafe-inline'", ...previewUrls],
                "style-src-attr": ["'unsafe-inline'"],
                "font-src": ["'self'", "data:"],
                "connect-src": ["'self'"],
                "img-src": ["'self'", "data:", "blob:"],
                "media-src": ["'self'", "data:"],
                "frame-src": previewUrls,
                upgradeInsecureRequests: process.env.NODE_ENV === "development" ? null : [], // Upgrade all requests to HTTPS on production
            },
            useDefaults: false, // Avoid default values for not explicitly set directives
        },
        xFrameOptions: false, // Disable deprecated X-Frame-Options header
        crossOriginResourcePolicy: { policy: "same-origin" }, // Do not allow cross-origin requests to access the response
        crossOriginEmbedderPolicy: false, // Disable Cross-Origin-Embedder-Policy as it is not needed (value=no-corp)
        crossOriginOpenerPolicy: true, // Enable Cross-Origin-Opener-Policy (value=same-origin)
        strictTransportSecurity: {
            // Enable Strict-Transport-Security
            maxAge: 63072000, // 2 years (recommended when subdomains are included)
            includeSubDomains: true,
            preload: true, // Enable preload list (recommended if subdomains are included)
        },
        referrerPolicy: {
            policy: "no-referrer", // No referrer information needs to be sent
        },
        xContentTypeOptions: true, // Enable X-Content-Type-Options (value=nosniff)
        xDnsPrefetchControl: false, // Disable this non-standard header as recommended by MDN
        xPermittedCrossDomainPolicies: true, // Enable X-Permitted-Cross-Domain-Policies (value=none)
    }),
);

app.get("/status/health", (req, res) => {
    res.setHeader("cache-control", "no-store");
    res.send("OK!");
});

const proxyMiddleware = createProxyMiddleware({
    target: process.env.API_URL_INTERNAL + "/dam",
    changeOrigin: true,
});
app.use("/dam", proxyMiddleware);

app.use(
    expressStaticGzip("./build", {
        enableBrotli: true,
        orderPreference: ["br", "gz"],
        index: false, // Don't send index.html for requests to "/" as it will be handled by the fallback route (with replaced environment variables)
        serveStatic: {
            setHeaders: (res, filePath) => {
                if ([".js", ".js.br", ".js.gz", ".css", ".css.br", ".css.gz"].some((fileExtension) => filePath.endsWith(fileExtension))) {
                    // The js file is static and the index.html uses a parameter as cache buster
                    // implemented as suggested by https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#caching_static_assets
                    res.setHeader("cache-control", "private, max-age=31536000, immutable");
                } else {
                    // Icons and Fonts could be changed over time, cache for 7d
                    res.setHeader("cache-control", "private, max-age=604800, immutable");
                }
            },
        },
    }),
);

// As a fallback, route everything to index.html
app.get("/{*splat}", (req, res) => {
    // Don't cache the index.html at all to make sure applications updates are applied
    // implemented as suggested by https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#preventing_storing
    res.setHeader("cache-control", "no-store");
    res.send(indexFile);
});

app.listen(port, host, () => {
    console.log(`Admin app listening at http://${host}:${port}`);
});
