// Inspired by https://testing-library.com/docs/react-testing-library/setup/#custom-render
import { createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { enUS } from "date-fns/locale";
import type { ReactElement, ReactNode } from "react";
import { IntlProvider } from "react-intl";

import { MuiThemeProvider } from "../mui/ThemeProvider";
import { RouterMemoryRouter } from "../router/MemoryRouter";

const messages = {};
const theme = createTheme();

function DefaultWrapper({ children }: { children?: ReactNode }) {
    return (
        <IntlProvider locale="en" messages={messages}>
            <LocalizationProvider adapterLocale={enUS} dateAdapter={AdapterDateFns}>
                <MuiThemeProvider theme={theme}>
                    <RouterMemoryRouter>{children}</RouterMemoryRouter>
                </MuiThemeProvider>
            </LocalizationProvider>
        </IntlProvider>
    );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, "queries">): RenderResult {
    return render(ui, { wrapper: DefaultWrapper, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
