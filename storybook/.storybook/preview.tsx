import "@fontsource-variable/roboto-flex/full.css";

import { LicenseInfo } from "@mui/x-license";
import type { Preview } from "@storybook/react-vite";
import type { GlobalTypes } from "storybook/internal/csf";

import { DextinityConfigProviderDecorator } from "./decorators/DextinityConfigProvider.decorator";
import { IntlDecorator, LocaleOption } from "./decorators/IntlProvider.decorator";
import { LayoutDecorator, LayoutOption } from "./decorators/Layout.decorator";
import { ThemeOption, ThemeProviderDecorator } from "./decorators/ThemeProvider.decorator";
import { worker } from "./mocks/browser";

if (import.meta.env.MUI_LICENSE_KEY) {
    LicenseInfo.setLicenseKey(import.meta.env.MUI_LICENSE_KEY);
}

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

const workerStarted = worker.start({ onUnhandledRequest: "bypass" });

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [ThemeProviderDecorator, IntlDecorator, LayoutDecorator, DextinityConfigProviderDecorator],
    loaders: [
        async () => {
            await workerStarted;
            return {};
        },
    ],
    parameters: {
        options: {
            /**
             * Note: according to: https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy#sorting-stories
             * the `storySort` function gets injected as javascript. Adding types is not possible
             */
            storySort: (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                a,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                b,
            ) => {
                const orderGettingStarted = [
                    "docs-getting-started-installation",
                    "docs-getting-started-structure",
                    "docs-getting-started-develop-in-project",
                    "docs-getting-started-how-to-write-stories",
                    "docs-getting-started",
                ];
                const orderComponents = [
                    "docs-components-master",
                    "docs-components-menu",
                    "docs-components-appheader",
                    "docs-components-toolbar",
                    "docs-components-table",
                    "docs-components-stack",
                    "docs-components-edit-dialog",
                    "docs-components-error-handling",
                    "docs-components-router",
                    "docs-components-router-tabs",
                    "docs-components-selection",
                    "docs-components-datagrid",
                    "docs-components-color-picker",
                    "docs-components-date-picker",
                    "docs-components-react-select",
                    "docs-components-rich-text-editor",
                    "docs-components",
                ];
                const orderForm = [
                    "docs-form-overview",
                    "docs-form-validation",
                    "docs-form-layout",
                    "docs-form-components-date-time-pickers",
                    "docs-form-components-finalform",
                    "docs-form-components-fieldcontainer",
                    "docs-form-components-field",
                    "docs-form-components-formsection",
                    "docs-form-components-finalform-fields",
                    "docs-form-components",
                ];
                const orderHooks = ["docs-hooks-hooks", "docs-hooks"];
                const orderHelper = ["docs-helper-clipboard"];
                const orderIcons = ["docs-icons-all-icons", "docs-icons-usage", "docs-icons"];
                const orderBestPractices = ["docs-best-practices-overview", "docs-best-theme-and-styling", "docs-best-practices"];
                const orderDevelopment = ["docs-development-overview", "docs-development-create-a-component-with-theme-support", "docs-development"];

                const order = [
                    "docs-intro-",
                    ...orderGettingStarted,
                    ...orderComponents,
                    ...orderForm,
                    ...orderHooks,
                    ...orderHelper,
                    ...orderIcons,
                    ...orderBestPractices,
                    ...orderDevelopment,
                    "component-docs-",
                    "admin-",
                    "stories-",
                ];

                const aName = a.id;
                const bName = b.id;

                const aIdx = order.findIndex((i) => aName.indexOf(i) > -1);
                const bIdx = order.findIndex((i) => bName.indexOf(i) > -1);
                return aIdx - bIdx;
            },
        },

        docs: {
            codePanel: true,
        },
    },
};

export default preview;
