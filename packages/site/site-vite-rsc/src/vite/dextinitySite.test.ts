// @vitest-environment node
import { resolve } from "node:path";

import { type EnvironmentOptions, resolveConfig } from "vite";
import { describe, expect, it } from "vitest";

import { dextinitySite } from "./dextinitySite.js";

async function resolveSiteConfig() {
    return resolveConfig({ configFile: false, root: import.meta.dirname, plugins: [dextinitySite({ app: "./src/handler.ts" })] }, "serve");
}

describe("dextinitySite", () => {
    it("resolves the optimized dependencies of plugin-rsc through this package", async () => {
        const config = await resolveSiteConfig();
        const configPlugin = config.plugins.find((plugin) => plugin.name === "@dextinity/site-vite-rsc:config");
        const configEnvironment = configPlugin?.configEnvironment as (name: string, config: EnvironmentOptions) => void;
        // Added by plugin-rsc when the project doesn't install react-server-dom-webpack
        const environmentConfig: EnvironmentOptions = {
            optimizeDeps: { include: ["@vitejs/plugin-rsc/vendor/react-server-dom/client.browser", "react-dom/client"] },
        };

        configEnvironment("client", environmentConfig);

        expect(environmentConfig.optimizeDeps?.include).toEqual([
            "@dextinity/site-vite-rsc > @vitejs/plugin-rsc/vendor/react-server-dom/client.browser",
            "react-dom/client",
        ]);
    });

    it("doesn't optimize this package, so that plugin-rsc transforms its client components", async () => {
        const config = await resolveSiteConfig();

        for (const environment of Object.values(config.environments)) {
            expect(environment.optimizeDeps.exclude).toContain("@dextinity/site-vite-rsc");
        }
    });

    it("bundles this package in the server environments", async () => {
        const config = await resolveSiteConfig();

        expect(config.environments.rsc.resolve.noExternal).toContain("@dextinity/site-vite-rsc");
        expect(config.environments.ssr.resolve.noExternal).toContain("@dextinity/site-vite-rsc");
    });

    it("resolves the app module to the project's app relative to the root", async () => {
        const config = await resolveSiteConfig();

        const appPlugin = config.plugins.find((plugin) => plugin.name === "@dextinity/site-vite-rsc:app");
        const resolveId = appPlugin?.resolveId as ((source: string) => string | undefined) | undefined;
        expect(resolveId?.("virtual:dextinity-site/app")).toBe(resolve(import.meta.dirname, "src/handler.ts"));
        expect(resolveId?.("./other")).toBeUndefined();
    });

    it("ignores the .env files of the project", async () => {
        const config = await resolveSiteConfig();

        expect(config.envDir).toBe(false);
    });

    it("builds the client assets into _assets", async () => {
        const config = await resolveSiteConfig();

        expect(config.environments.client.build.assetsDir).toBe("_assets");
    });
});
