import { paperClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiCard: GetMuiComponentTheme<"MuiCard"> = (component, { spacing }) => ({
    ...component,
    defaultProps: {
        square: false,
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiCard">(component?.styleOverrides, {
        root: {
            [`&.${paperClasses.rounded}`]: {
                borderRadius: "4px",
            },
        },
    }),
});
