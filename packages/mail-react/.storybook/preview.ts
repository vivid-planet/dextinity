import { parameters as mailParameters } from "../src/storybook/preview.ts";

export { decorators, initialGlobals } from "../src/storybook/preview.ts";

export const parameters = {
    ...mailParameters,
    layout: "fullscreen",
    options: {
        storySort: {
            order: ["Docs", "Examples", "Layout Patterns", "Components", "Blocks", "*"],
        },
    },
    docs: {
        source: {
            // Regenerate the "Show code" snippet from the rendered JSX; the default shows the whole
            // story object literal for stories with a custom render function.
            type: "dynamic",
        },
    },
};
