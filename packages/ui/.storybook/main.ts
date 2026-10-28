import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/**/__stories__/*.stories.tsx"],
    addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
    framework: "@storybook/react-vite",
};

export default config;
