import { resolve } from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
    framework: "@storybook/react-vite",
    viteFinal: (config) => {
        // vite.config.mts precompresses the app build for server/index.ts, which Storybook doesn't use.
        config.plugins = config.plugins?.filter((plugin) => !(plugin && "name" in plugin && plugin.name.startsWith("vite-plugin-compression")));
        // The story tests don't load vite.config.mts, so the alias has to be set here for them too.
        config.resolve = { ...config.resolve, alias: { ...config.resolve?.alias, "@src": resolve(import.meta.dirname, "../src") } };
        return config;
    },
};

export default config;
