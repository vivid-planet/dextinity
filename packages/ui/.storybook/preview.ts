import "@fontsource-variable/inter";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";
import "@fontsource/source-sans-pro/700.css";
import "../icons.css";

import type { Preview } from "@storybook/react-vite";

import { CanvasWithStyleSource } from "../src/storybook/CanvasWithStyleSource";
import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";
import { DocsPage } from "../src/storybook/docs/DocsPage";
import { renderSourceWithArgs } from "../src/storybook/renderSourceWithArgs";

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [colorSchemeBackgroundDecorator],
    parameters: {
        options: {
            storySort: {
                // Mirrors the structure of the design system draft
                order: [
                    "Intro",
                    "Foundations",
                    ["Typography", "Icons", ["Icon", "All icons", "Customize icons"], "Theme", ["Overview", "Customize brand", "Theme"]],
                    "Building blocks",
                    ["Buttons", "Form fields", "Status, tags & badges", "Loading & save state"],
                    "Shell",
                    "Patterns",
                ],
            },
        },
        docs: {
            codePanel: true,
            page: DocsPage,
            components: { Canvas: CanvasWithStyleSource },
            source: { type: "dynamic", transform: renderSourceWithArgs },
        },
    },
};

export default preview;
