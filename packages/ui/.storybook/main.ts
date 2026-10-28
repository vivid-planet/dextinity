import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
    stories: ["../src/**/__stories__/*.stories.tsx"],
    addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
    framework: "@storybook/react-vite",
    viteFinal: (viteConfig) =>
        mergeConfig(viteConfig, {
            build: {
                // Base UI marks its modules with "use client", which has no meaning in the client-only Storybook bundle
                rolldownOptions: { checks: { moduleLevelDirective: false } },
            },
        }),
};

export default config;
