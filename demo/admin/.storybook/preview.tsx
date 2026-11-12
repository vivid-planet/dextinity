import "@fontsource-variable/roboto-flex/full.css";

import type { Preview } from "@storybook/react-vite";

import { IntlProviderDecorator } from "./decorators/IntlProvider.decorator";
import { LocalizationProviderDecorator } from "./decorators/LocalizationProvider.decorator";
import { ThemeProviderDecorator } from "./decorators/ThemeProvider.decorator";

const preview: Preview = {
    tags: ["autodocs"],
    // The first decorator is the innermost one.
    decorators: [LocalizationProviderDecorator, ThemeProviderDecorator, IntlProviderDecorator],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            test: "todo",
        },
        docs: {
            codePanel: true,
        },
    },
};

export default preview;
