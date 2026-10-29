import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import type { Plugin, PluginOption } from "vite";

const packageName = "@dextinity/site-vite-rsc";

export type DextinitySiteOptions = {
    /** The RSC, SSR and browser entries of the site */
    entries: { rsc: string; ssr: string; client: string };
};

/**
 * Vite plugins for a Dextinity site with React Server Components
 */
export function dextinitySite({ entries }: DextinitySiteOptions): PluginOption[] {
    return [rsc({ entries }), react(), dextinitySiteConfig()];
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
                // plugin-rsc has to transform the "use client" files of this package
                optimizeDeps: { exclude: [packageName] },
                resolve: name === "client" ? undefined : { noExternal: [packageName] },
            };
        },
    };
}
