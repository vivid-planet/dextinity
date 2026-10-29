import "@fontsource-variable/inter";

import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
    tags: ["autodocs"],
    parameters: {
        docs: {
            codePanel: true,
        },
    },
};

export default preview;
