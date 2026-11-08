import "@fontsource-variable/inter";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";
import "@fontsource/source-sans-pro/700.css";
import "../icons.css";

import type { Preview } from "@storybook/react-vite";

import { brandDecorator } from "../src/storybook/brandDecorator";
import { CanvasWithStyleSource } from "../src/storybook/CanvasWithStyleSource";
import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";
import { renderSourceWithArgs } from "../src/storybook/renderSourceWithArgs";

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [colorSchemeBackgroundDecorator, brandDecorator],
    parameters: {
        options: {
            storySort: {
                order: ["Intro", "*", "Theme", ["Overview", "Customize brand", "Customize icons", "All icons"], "Components"],
            },
        },
        docs: {
            codePanel: true,
            components: { Canvas: CanvasWithStyleSource },
            source: { type: "dynamic", transform: renderSourceWithArgs },
        },
    },
};

export default preview;
