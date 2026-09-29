import { greyPalette, primaryPalette } from "@dextinity/admin";
import { grey as muiGreyPalette } from "@mui/material/colors";
import type { CSSProperties } from "react";

import type { RteProps } from "../Rte";

export type RteThemeColors = {
    border: CSSProperties["color"];
    outerBorderOnHover: CSSProperties["color"];
    outerBorderOnFocus: CSSProperties["color"];
    toolbarBackground: CSSProperties["color"];
    buttonIcon: CSSProperties["color"];
    buttonIconDisabled: CSSProperties["color"];
    buttonBackgroundHover: CSSProperties["color"];
    buttonBorderHover: CSSProperties["color"];
    buttonBorderDisabled: CSSProperties["color"];
};

interface RteTheme {
    colors: RteThemeColors;
}

export default (themeProps: Partial<RteProps> | undefined): RteTheme => {
    return {
        colors: {
            border: themeProps?.colors?.border ? themeProps.colors.border : greyPalette[100],
            outerBorderOnHover: themeProps?.colors?.outerBorderOnHover ? themeProps.colors.outerBorderOnHover : greyPalette[200],
            outerBorderOnFocus: themeProps?.colors?.outerBorderOnFocus ? themeProps.colors.outerBorderOnFocus : primaryPalette.main,
            toolbarBackground: themeProps?.colors?.toolbarBackground ? themeProps.colors.toolbarBackground : muiGreyPalette[100],
            buttonIcon: themeProps?.colors?.buttonIcon ? themeProps.colors.buttonIcon : muiGreyPalette[600],
            buttonIconDisabled: themeProps?.colors?.buttonIconDisabled ? themeProps.colors.buttonIconDisabled : muiGreyPalette[300],
            buttonBackgroundHover: themeProps?.colors?.buttonBackgroundHover ? themeProps.colors.buttonBackgroundHover : muiGreyPalette[200],
            buttonBorderHover: themeProps?.colors?.buttonBorderHover ? themeProps.colors.buttonBorderHover : muiGreyPalette[400],
            buttonBorderDisabled: themeProps?.colors?.buttonBorderDisabled ? themeProps.colors.buttonBorderDisabled : muiGreyPalette[100],
        },
    };
};
