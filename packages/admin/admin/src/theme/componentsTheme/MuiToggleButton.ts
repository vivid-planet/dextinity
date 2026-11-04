import { toggleButtonClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiToggleButton: GetMuiComponentTheme<"MuiToggleButton"> = (component, { palette }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiToggleButton">(component?.styleOverrides, {
        root: {
            borderColor: palette.grey[100],

            [`&.${toggleButtonClasses.selected}`]: {
                backgroundColor: "transparent",
                borderBottom: `2px solid ${palette.primary.main}`,
                color: palette.primary.main,
            },
        },
    }),
});
