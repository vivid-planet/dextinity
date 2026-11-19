import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)"],
    staticDirs: ["./public"],

    addons: ["@storybook/addon-docs", "@storybook/addon-vitest", "storybook-addon-tag-badges"],
    framework: "@storybook/react-vite",
    viteFinal: (viteConfig) =>
        mergeConfig(viteConfig, {
            build: {
                // Dependencies such as MUI mark their modules with "use client", which has no meaning in the client-only Storybook bundle
                rolldownOptions: { checks: { moduleLevelDirective: false } },
            },
        }),
};
export default config;
