import { dividerClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiList: GetMuiComponentTheme<"MuiList"> = (component, { palette }) => ({
    ...component,
    defaultProps: {
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiList">(component?.styleOverrides, {
        root: {
            [`& .${dividerClasses.root}`]: {
                margin: "8px 10px",
                borderColor: palette.grey[50],
            },
        },
    }),
});
