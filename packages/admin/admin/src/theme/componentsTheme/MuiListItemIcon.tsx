import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiListItemIcon: GetMuiComponentTheme<"MuiListItemIcon"> = (component, { spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiListItemIcon">(component?.styleOverrides, {
        root: {
            minWidth: 0,
            marginRight: spacing(2),
        },
    }),
});
