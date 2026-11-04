import { createContext, type PropsWithChildren, type ReactNode, useContext } from "react";

import type { Theme } from "./themeTypes.js";

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ theme, children }: PropsWithChildren<{ theme: Theme }>): ReactNode {
    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
    const theme = useContext(ThemeContext);

    if (theme === null) {
        throw new Error("useTheme must be used within a ThemeProvider (or MjmlMailRoot).");
    }

    return theme;
}

/** Returns the current theme or `null` if no `ThemeProvider` is present. Internal use only. */
export function useOptionalTheme(): Theme | null {
    return useContext(ThemeContext);
}
