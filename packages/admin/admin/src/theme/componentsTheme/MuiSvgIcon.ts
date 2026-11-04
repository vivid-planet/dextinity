import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiSvgIcon: GetMuiComponentTheme<"MuiSvgIcon"> = (component, { palette }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiSvgIcon">(component?.styleOverrides, {
        root: {},
        colorDisabled: {
            color: palette.grey[200],
        },
        fontSizeSmall: {
            fontSize: 10,
        },
        fontSizeMedium: {
            fontSize: 16,
        },
        fontSizeLarge: {
            fontSize: 20,
        },
    }),
});
