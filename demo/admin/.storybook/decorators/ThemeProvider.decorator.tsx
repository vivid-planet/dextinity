import { MuiThemeProvider } from "@dextinity/admin";
import { CssBaseline } from "@mui/material";
import { enUS } from "@mui/material/locale";
import { enUS as dataGridEnUS } from "@mui/x-data-grid-pro/locales";
import { enUS as datePickersEnUS } from "@mui/x-date-pickers/locales";
import { createTheme } from "@src/theme";
import type { Decorator } from "@storybook/react-vite";

const theme = createTheme([enUS, dataGridEnUS, datePickersEnUS]);

export const ThemeProviderDecorator: Decorator = (Story) => (
    <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
    </MuiThemeProvider>
);
