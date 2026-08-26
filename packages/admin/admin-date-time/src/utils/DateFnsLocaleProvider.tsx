import type { Locale } from "date-fns";
import { createContext, useContext } from "react";

/**
 * @deprecated The `@dextinity/admin-date-time` package is deprecated. Provide the date-fns locale via MUI X's `LocalizationProvider` (`adapterLocale`) from `@mui/x-date-pickers` instead.
 */
export const DateFnsLocaleContext = createContext<Locale | undefined>(undefined);

/**
 * @deprecated The `@dextinity/admin-date-time` package is deprecated. Provide the date-fns locale via MUI X's `LocalizationProvider` (`adapterLocale`) from `@mui/x-date-pickers` instead.
 */
export const DateFnsLocaleProvider = DateFnsLocaleContext.Provider;

/**
 * @deprecated The `@dextinity/admin-date-time` package is deprecated. Provide the date-fns locale via MUI X's `LocalizationProvider` (`adapterLocale`) from `@mui/x-date-pickers` instead.
 */
export function useDateFnsLocale() {
    return useContext(DateFnsLocaleContext);
}
