import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiLinearProgress: GetMuiComponentTheme<"MuiLinearProgress"> = (component) => ({
    ...component,
    defaultProps: {
        color: "primary",
    },
    styleOverrides: mergeOverrideStyles<"MuiLinearProgress">(component?.styleOverrides, {
        root: {
            height: "2px",
            zIndex: 1, // for use in LoadingOverlay of DataGrid, otherwise the LinearProgress is behind the border
        },
    }),
});
