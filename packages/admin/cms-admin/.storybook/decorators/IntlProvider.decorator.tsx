import { type Decorator } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";

export enum LocaleOption {
    German = "de",
    English = "en",
}

// @TODO: use messages from lang-package
export const IntlDecorator: Decorator = (fn, context) => {
    const { locale: selectedLocale = LocaleOption.English } = context.globals;

    return (
        <IntlProvider
            locale={selectedLocale}
            onError={() => {
                // disable error logging
            }}
        >
            {fn()}
        </IntlProvider>
    );
};
