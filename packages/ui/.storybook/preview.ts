import "@fontsource-variable/inter";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";
import "@fontsource/source-sans-pro/700.css";
import "../icons.css";

import type { Preview } from "@storybook/react-vite";

import { brandDecorator } from "../src/storybook/brandDecorator";
import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [colorSchemeBackgroundDecorator, brandDecorator],
    parameters: {
        docs: {
            codePanel: true,
        },
    },
};

export default preview;
