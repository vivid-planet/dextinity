import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/**/__stories__/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
    framework: "@storybook/react-vite",
    viteFinal: (config) => {
        // vite.config.mts precompresses the app build for server/index.ts, which Storybook doesn't use.
        config.plugins = config.plugins?.filter((plugin) => !(plugin && "name" in plugin && plugin.name.startsWith("vite-plugin-compression")));
        return config;
    },
};

export default config;
