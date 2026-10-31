import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { isCSSRequest, type Plugin, type PluginOption } from "vite";

const packageName = "@dextinity/site-vite-rsc";
const appModuleId = "virtual:dextinity-site/app";
const reportErrorModuleId = "virtual:dextinity-site/report-error";
const defaultReportErrorModuleId = `\0${reportErrorModuleId}`;

export type DextinitySiteOptions = {
    /** The module exporting the Hono app of the site as `app`, relative to the Vite root */
    app: string;
    /**
     * The module exporting `reportError(error)`, relative to the Vite root, e.g. to report errors to an error tracking service.
     * Called for all unexpected errors on the server and in the browser. Logs the errors with `console.error()` if not set.
     */
    reportError?: string;
};

/**
 * Vite plugins for a Dextinity site with React Server Components
 */
export function dextinitySite({ app, reportError }: DextinitySiteOptions): PluginOption[] {
    return [
        rsc({
            entries: {
                rsc: fileURLToPath(new URL("../entry.rsc.js", import.meta.url)),
                ssr: fileURLToPath(new URL("../entry.ssr.js", import.meta.url)),
                client: fileURLToPath(new URL("../entry.browser.js", import.meta.url)),
            },
        }),
        react(),
        dextinitySiteConfig(),
        dextinitySiteApp(app),
        dextinitySiteReportError(reportError),
        dextinitySiteDevCss(),
    ];
}

function dextinitySiteApp(app: string): Plugin {
    let root: string;
    return {
        name: `${packageName}:app`,
        configResolved(config) {
            root = config.root;
        },
        resolveId(source) {
            if (source === appModuleId) {
                return resolve(root, app);
            }
        },
    };
}

function dextinitySiteReportError(reportError: string | undefined): Plugin {
    let root: string;
    return {
        name: `${packageName}:report-error`,
        configResolved(config) {
            root = config.root;
        },
        resolveId(source) {
            if (source === reportErrorModuleId) {
                return reportError ? resolve(root, reportError) : defaultReportErrorModuleId;
            }
        },
        load(id) {
            if (id === defaultReportErrorModuleId) {
                return "export function reportError(error) { console.error(error); }";
            }
        },
    };
}

/**
 * In dev, plugin-rsc renders the CSS of client components as `<link>` with the same URL that the client component imports as JS module.
 * Vite answers with CSS or JS depending on the `Accept` header, so without `Vary: Accept` the browser uses the cached response of one for the other on back navigation.
 */
function dextinitySiteDevCss(): Plugin {
    return {
        name: `${packageName}:dev-css`,
        apply: "serve",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url && isCSSRequest(req.url)) {
                    res.appendHeader("Vary", "Accept");
                }
                next();
            });
        },
    };
}

function dextinitySiteConfig(): Plugin {
    return {
        name: `${packageName}:config`,
        config() {
            return {
                // Sites don't use VITE_* variables, and the .env files of a project would set NODE_ENV for the build
                envDir: false,
                environments: {
                    client: {
                        // Served with a long cache duration, the files in public/assets with a shorter one
                        build: { assetsDir: "_assets" },
                    },
                },
            };
        },
        configEnvironment(name, config) {
            // plugin-rsc is a dependency of this package, so projects can only resolve it through this package
            if (config.optimizeDeps?.include) {
                config.optimizeDeps.include = config.optimizeDeps.include.map((entry) =>
                    entry.startsWith("@vitejs/plugin-rsc") ? `${packageName} > ${entry}` : entry,
                );
            }

            return {
                optimizeDeps: {
                    // plugin-rsc only optimizes `react-dom/server.edge`, without this Vite runs the CommonJS files of the Node build unbundled
                    include: name === "ssr" ? ["react-dom/server"] : undefined,
                    // plugin-rsc has to transform the "use client" files of this package
                    exclude: [packageName],
                },
                resolve: name === "client" ? undefined : { noExternal: [packageName] },
            };
        },
    };
}
