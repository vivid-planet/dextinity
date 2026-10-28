import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)"],
    staticDirs: ["./public"],

    addons: ["@storybook/addon-docs", "@storybook/addon-vitest", "storybook-addon-tag-badges"],
    framework: "@storybook/react-vite",
};
export default config;
