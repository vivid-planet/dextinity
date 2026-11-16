// Inspired by https://testing-library.com/docs/react-testing-library/setup/#custom-render
import { createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { enUS } from "date-fns/locale";
import { type PropsWithChildren, type ReactElement, useLayoutEffect } from "react";
import { IntlProvider } from "react-intl";
import { type Location, useLocation } from "react-router";

import { MuiThemeProvider } from "../mui/ThemeProvider";
import { RouterMemoryRouter, type RouterMemoryRouterProps } from "../router/MemoryRouter";

const messages = {};
const theme = createTheme();

function createDefaultWrapper(routerProps: RouterMemoryRouterProps) {
    return function DefaultWrapper({ children }: PropsWithChildren) {
        return (
            <IntlProvider locale="en" messages={messages}>
                <LocalizationProvider adapterLocale={enUS} dateAdapter={AdapterDateFns}>
                    <MuiThemeProvider theme={theme}>
                        <RouterMemoryRouter {...routerProps}>{children}</RouterMemoryRouter>
                    </MuiThemeProvider>
                </LocalizationProvider>
            </IntlProvider>
        );
    };
}

type CustomRenderOptions = Omit<RenderOptions, "queries"> & Pick<RouterMemoryRouterProps, "initialEntries" | "initialIndex">;

function customRender(ui: ReactElement, { initialEntries, initialIndex, ...options }: CustomRenderOptions = {}): RenderResult {
    return render(ui, { wrapper: createDefaultWrapper({ initialEntries, initialIndex }), ...options });
}

/**
 * Reports the router's location after every navigation. Data router navigations are asynchronous, so assert inside `waitFor()`.
 */
export function LocationSpy({ onChange }: { onChange: (location: Location) => void }) {
    const location = useLocation();
    useLayoutEffect(() => {
        onChange(location);
    }, [location, onChange]);
    return null;
}

export * from "@testing-library/react";
export { customRender as render };
