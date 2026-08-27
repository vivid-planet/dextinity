import { type Components, createTheme, type Theme, type ThemeOptions } from "@mui/material";
import { createBreakpoints } from "@mui/system";
import { deepmerge } from "@mui/utils";

import { breakpointsOptions as dextinityBreakpointsOptions } from "./breakpointsOptions";
import { getComponentsTheme } from "./componentsTheme/getComponentsTheme";
import { paletteOptions as dextinityPaletteOptions } from "./paletteOptions";
import { shadows } from "./shadows";
import { createTypographyOptions } from "./typographyOptions";

export const createDextinityTheme = (
    {
        palette: passedPaletteOptions = {},
        typography: passedTypographyOptions = {},
        spacing: passedSpacingOptions = 5,
        components: passedComponentsOptions = {},
        zIndex: passedZIndexOptions = {},
        breakpoints: passedBreakpointsOptions = {},
        ...restPassedOptions
    }: ThemeOptions | undefined = {},
    ...args: object[]
): Theme => {
    const breakpointsOptions = deepmerge(dextinityBreakpointsOptions, passedBreakpointsOptions);
    const breakpoints = createBreakpoints(breakpointsOptions);

    const paletteOptions = deepmerge(dextinityPaletteOptions, passedPaletteOptions);
    const { palette } = createTheme({ palette: paletteOptions });

    const passedTypographyOptionsObject = typeof passedTypographyOptions === "function" ? passedTypographyOptions(palette) : passedTypographyOptions;
    const typographyOptions = deepmerge(createTypographyOptions(breakpoints), passedTypographyOptionsObject);

    const dextinityThemeOptionsBeforeAddingComponents = {
        spacing: passedSpacingOptions,
        palette: {
            ...paletteOptions,
            DataGrid: {
                ...paletteOptions.DataGrid,
                bg: "rgb(255, 255, 255)",
            },
        },
        typography: typographyOptions,
        shape: {
            borderRadius: 2,
        },
        shadows,
        zIndex: passedZIndexOptions,
        breakpoints: breakpointsOptions,
    } satisfies ThemeOptions;

    const combinedThemeOptionsBeforeAddingComponents = deepmerge(dextinityThemeOptionsBeforeAddingComponents, restPassedOptions);
    const themeBeforeAddingComponents = createTheme(combinedThemeOptionsBeforeAddingComponents);

    const dextinityThemeOptions = {
        ...dextinityThemeOptionsBeforeAddingComponents,
        // `ThemeOptions["components"]` is typed with the full MUI theme while `Components` defaults to an
        // `unknown` theme. Both only use the theme type in the style-override callbacks, which are passed
        // through unchanged here.
        components: getComponentsTheme(passedComponentsOptions as Components, themeBeforeAddingComponents),
    } satisfies ThemeOptions;

    const themeOptions = deepmerge(dextinityThemeOptions, restPassedOptions);
    return createTheme(themeOptions, ...args);
};
