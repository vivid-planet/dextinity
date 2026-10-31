// @vitest-environment node
import { resolve } from "node:path";

import { type EnvironmentOptions, resolveConfig } from "vite";
import { describe, expect, it, vi } from "vitest";

import { dextinitySite, type DextinitySiteOptions } from "./dextinitySite.js";

async function resolveSiteConfig(options: Partial<DextinitySiteOptions> = {}) {
    return resolveConfig(
        { configFile: false, root: import.meta.dirname, plugins: [dextinitySite({ app: "./src/handler.ts", ...options })] },
        "serve",
    );
}

async function getReportErrorPlugin(options: Partial<DextinitySiteOptions> = {}) {
    const config = await resolveSiteConfig(options);
    const plugin = config.plugins.find((plugin) => plugin.name === "@dextinity/site-vite-rsc:report-error");
    return {
        resolveId: plugin?.resolveId as (source: string) => string | undefined,
        load: plugin?.load as (id: string) => string | undefined,
    };
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

    it("optimizes React DOM's server renderer for the SSR environment", async () => {
        const config = await resolveSiteConfig();

        expect(config.environments.ssr.optimizeDeps.include).toContain("react-dom/server");
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

    it("resolves the report error module to the project's module relative to the root", async () => {
        const { resolveId } = await getReportErrorPlugin({ reportError: "./src/reportError.ts" });

        expect(resolveId("virtual:dextinity-site/report-error")).toBe(resolve(import.meta.dirname, "src/reportError.ts"));
        expect(resolveId("./other")).toBeUndefined();
    });

    it("logs the errors when the project has no report error module", async () => {
        const { resolveId, load } = await getReportErrorPlugin();
        const id = resolveId("virtual:dextinity-site/report-error");
        const code = id ? load(id) : undefined;
        const { reportError } = await import(/* @vite-ignore */ `data:text/javascript,${encodeURIComponent(code ?? "")}`);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const error = new Error("Failed");

        reportError(error);

        expect(consoleError).toHaveBeenCalledWith(error);
        consoleError.mockRestore();
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
