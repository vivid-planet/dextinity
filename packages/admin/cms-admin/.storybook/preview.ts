import type { Preview } from "@storybook/react-vite";
import { type GlobalTypes } from "storybook/internal/csf";

import { ApolloDecorator } from "./decorators/Apollo.decorator";
import { DextinityConfigProviderDecorator } from "./decorators/DextinityConfigProvider.decorator";
import { ContentScopeProviderDecorator } from "./decorators/ContentScopeProvider.decorator";
import { CurrentUserProviderDecorator } from "./decorators/CurrentUserProvider.decorator";
import { DndProviderDecorator } from "./decorators/DndProvider.decorator";
import { IntlDecorator, LocaleOption } from "./decorators/IntlProvider.decorator";
import { LayoutDecorator, LayoutOption } from "./decorators/Layout.decorator";
import { RouterDecorator } from "./decorators/Router.decorator";
import { SnackbarDecorator } from "./decorators/Snackbar.decorator";
import { ThemeOption, ThemeProviderDecorator } from "./decorators/ThemeProvider.decorator";
import { worker } from "./mocks/browser";

const mswReady = typeof window === "undefined" ? Promise.resolve() : worker.start({ onUnhandledRequest: "bypass" });

export const globalTypes: GlobalTypes = {
    theme: {
        description: "Global MUI Theme",
        toolbar: {
            title: "Theme",
            icon: "paintbrush",
            items: [
                { value: ThemeOption.Dextinity, right: "🟩", title: "Dextinity Theme" },
                { value: ThemeOption.Mui, right: "🟦", title: "Mui Theme" },
            ],
            dynamicTitle: true,
        },
    },
    locale: {
        name: "Locale",
        description: "Locale",
        toolbar: {
            title: "Locale",
            icon: "globe",
            items: [
                { value: LocaleOption.English, title: "English", right: "🇺🇸" },
                { value: LocaleOption.German, title: "German", right: "🇩🇪" },
            ],
            dynamicTitle: true,
        },
    },
    layout: {
        description: "Layout",
        toolbar: {
            title: "Layout",
            icon: "switchalt",
            items: [
                { value: LayoutOption.Padded, title: "Padded" },
                { value: LayoutOption.Default, title: "Default" },
            ],
            dynamicTitle: true,
        },
    },
};

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [
        ThemeProviderDecorator,
        IntlDecorator,
        LayoutDecorator,
        ContentScopeProviderDecorator,
        RouterDecorator,
        DextinityConfigProviderDecorator,
        SnackbarDecorator,
        DndProviderDecorator,
        CurrentUserProviderDecorator,
        ApolloDecorator,
    ],
    loaders: [
        async () => {
            await mswReady;
            return {};
        },
    ],

    parameters: {
        docs: {
            codePanel: true,
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
