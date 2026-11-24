import "@fontsource-variable/roboto-flex/full.css";

import type { Preview } from "@storybook/react-vite";

import { ApolloDecorator } from "./decorators/Apollo.decorator";
import { ContentScopeProviderDecorator } from "./decorators/ContentScopeProvider.decorator";
import { CurrentUserProviderDecorator } from "./decorators/CurrentUserProvider.decorator";
import { DextinityConfigProviderDecorator } from "./decorators/DextinityConfigProvider.decorator";
import { DndProviderDecorator } from "./decorators/DndProvider.decorator";
import { IntlProviderDecorator } from "./decorators/IntlProvider.decorator";
import { LocalizationProviderDecorator } from "./decorators/LocalizationProvider.decorator";
import { RouterDecorator } from "./decorators/Router.decorator";
import { SnackbarDecorator } from "./decorators/Snackbar.decorator";
import { ThemeProviderDecorator } from "./decorators/ThemeProvider.decorator";

const preview: Preview = {
    tags: ["autodocs"],
    // The first decorator is the innermost one.
    decorators: [
        DndProviderDecorator,
        SnackbarDecorator,
        ContentScopeProviderDecorator,
        RouterDecorator,
        CurrentUserProviderDecorator,
        DextinityConfigProviderDecorator,
        ApolloDecorator,
        LocalizationProviderDecorator,
        ThemeProviderDecorator,
        IntlProviderDecorator,
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        docs: {
            codePanel: true,
        },
    },
};

export default preview;
