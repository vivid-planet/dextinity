import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiPaper: GetMuiComponentTheme<"MuiPaper"> = (component, { palette }) => ({
    ...component,
    defaultProps: {
        square: true,
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiPaper">(component?.styleOverrides, {
        outlined: {
            borderTop: "none",
            borderRight: "none",
            borderBottom: `1px solid ${palette.divider}`,
            borderLeft: "none",
        },
    }),
});
