import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig, type Plugin } from "vite";
import { compression } from "vite-plugin-compression2";

import { environment as envVarsToLoad } from "./src/environment.ts";

function injectEnvironmentValues({ mode }: { mode: string }): Plugin {
    return {
        name: "inject-environment-values",
        transformIndexHtml: () => [
            {
                tag: "script",
                children: envVarsToLoad
                    .map((envVarKey) => {
                        // In production, server/index.ts replaces the $-placeholders when it serves index.html
                        const value = mode === "production" ? `$${envVarKey}` : process.env[envVarKey];
                        return `window.EXTERNAL__${envVarKey}__ = ${value ? `'${value}'` : undefined};`;
                    })
                    .join("\n"),
                injectTo: "head",
            },
        ],
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        plugins: [
            react({
                jsxImportSource: "@emotion/react",
            }),
            compression(),
            injectEnvironmentValues({ mode }),
        ],
        server: {
            host: process.env.SERVER_HOST ?? "localhost",
            port: Number(process.env.ADMIN_PORT),
            cors: false,
            proxy: process.env.API_URL_INTERNAL
                ? {
                      "/api": {
                          target: new URL(process.env.API_URL_INTERNAL).origin,
                          changeOrigin: true,
                          secure: false,
                      },
                      "/dam": {
                          target: process.env.API_URL_INTERNAL,
                          changeOrigin: true,
                          secure: false,
                      },
                  }
                : undefined,
        },
        define: {
            // define NODE_ENV for packages using it
            "process.env.NODE_ENV": mode === "production" ? "'production'" : "'development'",
            // Node.js global to browser globalThis. https://github.com/vitejs/vite/discussions/5912
            // "global is not defined" occurs directly after loading. Used by draft-is package
            global: "globalThis",
        },
        resolve: {
            alias: {
                "@src": resolve(import.meta.dirname, "./src"),
            },
        },
        build: {
            outDir: "build",
        },
    };
});
