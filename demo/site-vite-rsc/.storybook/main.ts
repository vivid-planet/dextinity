import { resolve } from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
    framework: {
        name: "@storybook/react-vite",
        options: {
            builder: {
                viteConfigPath: resolve(import.meta.dirname, "vite.config.ts"),
            },
        },
    },
    staticDirs: ["../public"],
};

export default config;
