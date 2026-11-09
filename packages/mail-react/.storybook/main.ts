import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
    addons: [
        {
            name: "@storybook/addon-docs",
            options: {
                mdxPluginOptions: {
                    mdxCompileOptions: {
                        remarkPlugins: [remarkGfm],
                    },
                },
            },
        },
        "@storybook/addon-mcp",
        "@storybook/addon-vitest",
    ],
    framework: "@storybook/react-vite",
    features: { componentsManifest: true },
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
