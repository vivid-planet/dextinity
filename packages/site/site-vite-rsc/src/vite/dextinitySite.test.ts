import { resolve } from "node:path";

import { resolveConfig } from "vite";
import { describe, expect, it } from "vitest";

import { dextinitySite } from "./dextinitySite";

const entries = {
    rsc: resolve(import.meta.dirname, "entry.rsc.tsx"),
    ssr: resolve(import.meta.dirname, "entry.ssr.tsx"),
    client: resolve(import.meta.dirname, "entry.browser.tsx"),
};

async function resolveSiteConfig() {
    return resolveConfig({ configFile: false, root: import.meta.dirname, plugins: [dextinitySite({ entries })] }, "serve");
}

describe("dextinitySite", () => {
    it("resolves the optimized dependencies of plugin-rsc through this package", async () => {
        const config = await resolveSiteConfig();

        const pluginRscEntries = Object.values(config.environments)
            .flatMap((environment) => environment.optimizeDeps.include ?? [])
            .filter((entry) => entry.includes("@vitejs/plugin-rsc"));
        expect(pluginRscEntries.length).toBeGreaterThan(0);
        for (const entry of pluginRscEntries) {
            expect(entry).toMatch(/^@dextinity\/site-vite-rsc > @vitejs\/plugin-rsc/);
        }
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

    it("ignores the .env files of the project", async () => {
        const config = await resolveSiteConfig();

        expect(config.envDir).toBe(false);
    });

    it("builds the client assets into _assets", async () => {
        const config = await resolveSiteConfig();

        expect(config.environments.client.build.assetsDir).toBe("_assets");
    });
});
