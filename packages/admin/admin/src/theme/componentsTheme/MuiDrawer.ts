import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiDrawer: GetMuiComponentTheme<"MuiDrawer"> = (component, { palette, zIndex }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiDrawer">(component?.styleOverrides, {
        paper: {
            backgroundColor: palette.grey[50],
        },
    }),
});
