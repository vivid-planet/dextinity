import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
    addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
    framework: "@storybook/react-vite",
    viteFinal: (viteConfig) =>
        mergeConfig(viteConfig, {
            build: {
                // Minifying renames functions, and none of the components used here —
                // including `@faire/mjml-react`'s — set a `displayName` to survive that, so
                // the docs "Show code" snippet would print the mangled names.
                minify: false,
            },
        }),
};

export default config;
