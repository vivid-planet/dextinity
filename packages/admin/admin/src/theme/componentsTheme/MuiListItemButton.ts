import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import { commonListItemRootStyles } from "./commonListStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiListItemButton: GetMuiComponentTheme<"MuiListItemButton"> = (component) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiListItemButton">(component?.styleOverrides, {
        root: {
            ...commonListItemRootStyles,
        },
    }),
});
