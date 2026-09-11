import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { type Decorator } from "@storybook/react-vite";
import { de, enUS } from "date-fns/locale";
import { IntlProvider } from "react-intl";

export enum LocaleOption {
    German = "de",
    English = "en",
}

function isLocaleOption(value: any): value is LocaleOption {
    return value === "de" || value === "en";
}

type DateFnsLocale = typeof de;
const dateFnsLocales: Record<LocaleOption, DateFnsLocale> = {
    [LocaleOption.German]: de,
    [LocaleOption.English]: enUS,
};

// @TODO: use messages from lang-package
export const IntlDecorator: Decorator = (fn, context) => {
    const { locale: selectedLocale = LocaleOption.English } = context.globals;
    const selecteDateFnsLocale = isLocaleOption(selectedLocale) ? dateFnsLocales[selectedLocale] : dateFnsLocales.en;

    return (
        <IntlProvider
            locale={selectedLocale}
            onError={() => {
                // disable error logging
            }}
        >
            <LocalizationProvider adapterLocale={selecteDateFnsLocale} dateAdapter={AdapterDateFns}>
                {fn()}
            </LocalizationProvider>
        </IntlProvider>
    );
};
