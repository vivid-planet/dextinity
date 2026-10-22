import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

import { generateScopedName } from "../src/future-ui/cssModules/generateScopedName.ts";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)"],
    staticDirs: ["./public"],

    addons: ["@storybook/addon-docs", "@storybook/addon-vitest", "storybook-addon-tag-badges"],
    framework: "@storybook/react-vite",

    viteFinal(viteConfig) {
        return mergeConfig(viteConfig, {
            css: {
                modules: {
                    generateScopedName,
                },
            },
        });
    },
};
export default config;
