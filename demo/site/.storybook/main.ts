import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

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
        return config;
    },
};

export default config;
