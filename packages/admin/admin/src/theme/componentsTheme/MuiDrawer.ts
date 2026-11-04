import type { Components } from "@mui/material/styles";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiDrawer: GetMuiComponentTheme<"MuiDrawer"> = (component, { palette, zIndex }): Components["MuiDrawer"] => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiDrawer">(component?.styleOverrides, {
        paper: {
            backgroundColor: palette.grey[50],
        },
    }),
});
