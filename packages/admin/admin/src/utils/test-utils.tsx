// Inspired by https://testing-library.com/docs/react-testing-library/setup/#custom-render
import { createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { enUS } from "date-fns/locale";
import type { PropsWithChildren, ReactElement } from "react";
import { IntlProvider } from "react-intl";
import { createMemoryRouter, type DataRouter, type InitialEntry } from "react-router";

import { MuiThemeProvider } from "../mui/ThemeProvider";
import { catchAllRoutes, RouterProviderWithChildren } from "../router/RouterChildren";

const messages = {};
const theme = createTheme();

export function createTestRouter({ initialEntries, initialIndex }: { initialEntries?: InitialEntry[]; initialIndex?: number } = {}) {
    return createMemoryRouter(catchAllRoutes, { initialEntries, initialIndex });
}

export function createRouterWrapper(router: DataRouter) {
    return function RouterWrapper({ children }: PropsWithChildren) {
        return <RouterProviderWithChildren router={router}>{children}</RouterProviderWithChildren>;
    };
}

function createDefaultWrapper(router: DataRouter) {
    return function DefaultWrapper({ children }: PropsWithChildren) {
        return (
            <IntlProvider locale="en" messages={messages}>
                <LocalizationProvider adapterLocale={enUS} dateAdapter={AdapterDateFns}>
                    <MuiThemeProvider theme={theme}>
                        <RouterProviderWithChildren router={router}>{children}</RouterProviderWithChildren>
                    </MuiThemeProvider>
                </LocalizationProvider>
            </IntlProvider>
        );
    };
}

interface CustomRenderOptions extends Omit<RenderOptions, "queries"> {
    router?: DataRouter;
}

function customRender(
    ui: ReactElement,
    { router = createTestRouter(), ...options }: CustomRenderOptions = {},
): RenderResult & { router: DataRouter } {
    const renderResult: RenderResult = render(ui, { wrapper: createDefaultWrapper(router), ...options });
    return Object.assign(renderResult, { router });
}

export * from "@testing-library/react";
export { customRender as render };
