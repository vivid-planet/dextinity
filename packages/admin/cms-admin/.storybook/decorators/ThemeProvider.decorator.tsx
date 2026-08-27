import { createDextinityTheme, MuiThemeProvider } from "@dextinity/admin";
import { createTheme as createMuiTheme, CssBaseline } from "@mui/material";
import { type Decorator } from "@storybook/react-vite";

export enum ThemeOption {
    Dextinity = "dextinity",
    Mui = "mui",
}

export const ThemeProviderDecorator: Decorator = (fn, context) => {
    const { theme: selectedTheme } = context.globals;
    const theme = selectedTheme === ThemeOption.Mui ? createMuiTheme() : createDextinityTheme();
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {fn()}
        </MuiThemeProvider>
    );
};
