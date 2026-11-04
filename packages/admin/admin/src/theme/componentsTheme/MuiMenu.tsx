import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiMenu: GetMuiComponentTheme<"MuiMenu"> = (component, theme) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiMenu">(component?.styleOverrides, {
        paper: {
            minWidth: 220,
            borderRadius: 4,
            boxShadow: theme.shadows[3],
        },
    }),
});
