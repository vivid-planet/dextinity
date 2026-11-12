// Inspired by https://testing-library.com/docs/react-testing-library/setup/#custom-render
import { MuiThemeProvider, SnackbarProvider } from "@dextinity/admin";
import { createTheme } from "@mui/material";
import { render as testingLibraryRender, type RenderOptions, type RenderResult } from "@testing-library/react";
import { type ReactElement, type ReactNode, useLayoutEffect } from "react";
import { IntlProvider } from "react-intl";
import { type Location, type NavigationType, useLocation, useNavigationType } from "react-router";

const messages = {};
const theme = createTheme();

function DefaultWrapper({ children }: { children?: ReactNode }) {
    return (
        <IntlProvider locale="en" messages={messages}>
            <MuiThemeProvider theme={theme}>
                <SnackbarProvider>{children}</SnackbarProvider>
            </MuiThemeProvider>
        </IntlProvider>
    );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, "queries">): RenderResult {
    return testingLibraryRender(ui, { wrapper: DefaultWrapper, ...options });
}

/**
 * Reports the router's location after every navigation. Data router navigations are asynchronous, so assert inside `waitFor()`.
 */
export function LocationSpy({ onChange }: { onChange: (location: Location, navigationType: NavigationType) => void }) {
    const location = useLocation();
    const navigationType = useNavigationType();
    useLayoutEffect(() => {
        onChange(location, navigationType);
    }, [location, navigationType, onChange]);
    return null;
}

export * from "@testing-library/react";
export { customRender as render };
