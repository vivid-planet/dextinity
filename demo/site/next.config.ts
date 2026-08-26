import nextBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

import dextinityConfig from "./src/dextinity-config.json" with { type: "json" };

const withBundleAnalyzer = nextBundleAnalyzer({
    // eslint-disable-next-line no-restricted-syntax -- ANALYZE is a build-time-only dev tool flag, not environment-specific
    enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
    images: dextinityConfig.images,
    typescript: {
        // eslint-disable-next-line no-restricted-syntax -- NODE_ENV is set by Next.js itself, not environment-specific
        ignoreBuildErrors: process.env.NODE_ENV === "production",
    },
    experimental: {
        optimizePackageImports: ["@dextinity/site-nextjs"],
    },
    poweredByHeader: false,
    // https://nextjs.org/docs/advanced-features/security-headers (Content-Security-Policy and CORS are set in middleware/cspHeaders.ts)
    headers: async () => [
        {
            source: "/:path*",
            headers: [
                {
                    key: "Strict-Transport-Security", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
                    value: "max-age=63072000; includeSubDomains; preload", // 2 years (recommended when subdomains are included)
                },
                {
                    key: "Cross-Origin-Opener-Policy", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
                    value: "same-origin", // Only allow the same origin to open the page in a browsing context
                },
                {
                    key: "Cross-Origin-Embedder-Policy",
                    // This value should be set to 'require-corp' as soon as iframe credentialless is supported by all browsers
                    // https://developer.mozilla.org/en-US/docs/Web/Security/IFrame_credentialless
                    // https://caniuse.com/mdn-html_elements_iframe_credentialless
                    value: "unsafe-none",
                },
                {
                    key: "Cross-Origin-Resource-Policy", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy
                    value: "same-site", // Do not allow cross-origin requests to access the response
                },
                {
                    key: "Permissions-Policy", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy
                    value: "",
                },
                {
                    key: "X-Content-Type-Options", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
                    value: "nosniff", // Prevent MIME sniffing
                },
                {
                    // This should be changed when using web analytics tools. For example, use "strict-origin-when-cross-origin" for Google Analytics
                    key: "Referrer-Policy", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
                    value: "same-origin", // Only use referer on own domain.
                },
            ],
        },
    ],
    // eslint-disable-next-line no-restricted-syntax -- VALKEY_ENABLED is a server-start-time flag for cache handler setup
    cacheHandler: process.env.VALKEY_ENABLED === "true" ? import.meta.resolve("./dist/cache-handler.js").replace("file://", "") : undefined,
    // eslint-disable-next-line no-restricted-syntax -- VALKEY_ENABLED is a server-start-time flag for cache handler setup
    cacheMaxMemorySize: process.env.VALKEY_ENABLED === "true" ? 0 : undefined, // disable default in-memory caching
    rewrites: async () => {
        return {
            afterFiles: [
                {
                    // Show a 404 instead of trying to render page for paths starting with /_next/ or /assets/ as they don't get rewritten in DomainRewriteMiddleware and cause errors in ...path page
                    source: "/:prefix(_next|assets)/:path*",
                    destination: "/404",
                },
            ],
        };
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.module.rules.push({
                test: /\.[jt]sx?$/,
                include: [`${dirname(fileURLToPath(import.meta.url))}/src`],
                use: [
                    {
                        loader: "@dextinity/site-nextjs/webpackPersistedQueriesLoader",
                        options: {
                            persistedQueriesPath: ".next/persisted-queries.json",
                        },
                    },
                ],
            });
        }
        return config;
    },
};

export default withBundleAnalyzer(nextConfig);
