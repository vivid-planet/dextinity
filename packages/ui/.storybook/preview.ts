import type { Preview } from "@storybook/react-vite";

import { colorSchemeBackgroundDecorator } from "../src/storybook/colorSchemeBackgroundDecorator";

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [colorSchemeBackgroundDecorator],
    parameters: {
        docs: {
            codePanel: true,
        },
    },
};

export default preview;
