import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiToggleButtonGroup: GetMuiComponentTheme<"MuiToggleButtonGroup"> = (component, { palette }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiToggleButtonGroup">(component?.styleOverrides, {
        root: {
            backgroundColor: palette.common.white,
            borderRadius: 1,
        },
    }),
});
