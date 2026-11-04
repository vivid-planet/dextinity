import type { Theme } from "@mui/material";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { useIntl } from "react-intl";

interface Props {
    theme: Theme;
}

export const MuiThemeProvider = ({ theme, children }: PropsWithChildren<Props>) => {
    const intl = useIntl();

    if (theme.components?.MuiDataGrid?.defaultProps?.localeText) {
        // @ts-expect-error key 'filterOperatorSearch' does not exist in type 'GridLocaleText'
        theme.components.MuiDataGrid.defaultProps.localeText.filterOperatorSearch ??= intl.formatMessage({
            id: "dextinity.dataGrid.filterOperators.search",
            defaultMessage: "search",
        });
    }

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </StyledEngineProvider>
    );
};
