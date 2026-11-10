import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";
import type { Plugin } from "vitest/config";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const bundledSiteReactDirectory = "/lib/site-react/";

// @dextinity/site-nextjs bundles @dextinity/site-react into its `lib` but keeps site-react's own dependencies (e.g. `fast-equals`)
// as bare imports. They aren't dependencies of site-nextjs, so Vite can't resolve them from the bundled files. Resolve them from
// site-react instead.
const resolveBundledSiteReactDependencies: Plugin = {
    name: "resolve-bundled-site-react-dependencies",
    enforce: "pre",
    async resolveId(source, importer, options) {
        if (!importer?.includes(bundledSiteReactDirectory) || source.startsWith(".") || source.startsWith("/")) {
            return null;
        }

        const siteNextjsDirectory = importer.slice(0, importer.indexOf(bundledSiteReactDirectory));
        const siteReactImporter = resolve(siteNextjsDirectory, "node_modules/@dextinity/site-react/package.json");

        return this.resolve(source, siteReactImporter, { ...options, skipSelf: true });
    },
};

const config: StorybookConfig = {
    stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
    framework: {
        name: "@storybook/nextjs-vite",
        options: {
            // Loading the app's config keeps images and aliases in sync with the site.
            nextConfigPath: resolve(currentDirectory, "../next.config.ts"),
        },
    },
    staticDirs: ["../public"],
    viteFinal: (config) => {
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...config.resolve.alias,
            "@src": resolve(currentDirectory, "../src"),
        };
        config.plugins = [...(config.plugins ?? []), resolveBundledSiteReactDependencies];
        // Since the site is `"type": "module"`, Vite 8 gives default imports of CommonJS packages such as `redraft` the whole
        // `module.exports`, ignoring `__esModule`. Next.js's webpack build respects `__esModule`, so do the same here.
        config.legacy = { ...config.legacy, inconsistentCjsInterop: true };
        return config;
    },
};

export default config;
