import "@fontsource-variable/inter";

import type { Preview } from "@storybook/react-vite";

import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [colorSchemeBackgroundDecorator],
    parameters: {
        options: {
            storySort: {
                order: ["Intro", "Theme"],
            },
        },
        docs: {
            codePanel: true,
        },
    },
};

export default preview;
